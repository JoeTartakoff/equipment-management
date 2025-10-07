'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect, useRef } from 'react'
import PdfTemplate from '@/components/PdfTemplate'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function Home() {
  // 状態管理
  const [equipmentList] = useState(['AM-38N', 'MCF-10E', 'KOF-09', 'USB-12', 'NCG-10R'])
  const [unitList] = useState(Array.from({length: 22}, (_, i) => `${i + 1}師団`))
  
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [serialList, setSerialList] = useState([])
  const [selectedSerial, setSelectedSerial] = useState('')
  const [issuingUnit, setIssuingUnit] = useState('')
  const [receivingUnit, setReceivingUnit] = useState('')
  const [details, setDetails] = useState('')
  const [recorderName, setRecorderName] = useState('')
  const [certificateNo, setCertificateNo] = useState('0001')
  const [pdfData, setPdfData] = useState(null)
  const pdfRef = useRef(null)

  // ページロード時に次の証明書番号を取得
  useEffect(() => {
    async function fetchNextCertificateNo() {
      const { count, error } = await supabase
        .from('transaction_logs')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error('Error fetching certificate number:', error)
      } else {
        const nextNo = (count + 1).toString().padStart(4, '0')
        setCertificateNo(nextNo)
      }
    }
    
    fetchNextCertificateNo()
  }, [])

  // 機器名選択時にシリアル番号リストを取得
  useEffect(() => {
    if (!selectedEquipment) {
      setSerialList([])
      setSelectedSerial('')
      setIssuingUnit('')
      return
    }

    async function fetchSerials() {
      const { data, error } = await supabase
        .from('equipment_master')
        .select('*')
        .eq('equipment_name', selectedEquipment)
        .order('serial_number')
      
      if (error) {
        console.error('Error fetching serials:', error)
      } else {
        setSerialList(data)
      }
    }
    
    fetchSerials()
  }, [selectedEquipment])

  // シリアル番号選択時に発行元部隊を自動設定
  useEffect(() => {
    if (!selectedSerial) {
      setIssuingUnit('')
      return
    }

    const selected = serialList.find(item => item.id === selectedSerial)
    if (selected) {
      setIssuingUnit(selected.current_location)
    }
  }, [selectedSerial, serialList])

  // PDFダウンロードハンドラー
  const handlePdfDownload = async () => {
    if (!pdfRef.current) return

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

      const fileName = `証明書_${pdfData.certificateNo}_${pdfData.assetId}.pdf`
      pdf.save(fileName)

      alert('✅ PDFダウンロード完了!')
    } catch (error) {
      console.error('PDF download error:', error)
      alert('❌ PDFダウンロード中にエラーが発生しました。')
    }
  }

  // Excelダウンロードハンドラー
  // Excelダウンロードハンドラー
  const handleExcelDownload = async () => {
    try {
      const { data, error } = await supabase
        .from('transaction_logs')
        .select('*')
        .order('certificate_no', { ascending: true })
      
      if (error) throw error

      let excelData

      // データがない場合はヘッダー行のみ
      if (!data || data.length === 0) {
        excelData = [{
          '証明書番号': '',
          '記録日時': '',
          '機器ID': '',
          '発行元部隊': '',
          '受領先部隊': '',
          '内容': '',
          '記録者': ''
        }]
      } else {
        // データがある場合は通常通り
        excelData = data.map(row => ({
          '証明書番号': row.certificate_no,
          '記録日時': new Date(row.record_datetime).toLocaleString('ja-JP', {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          '機器ID': row.asset_id,
          '発行元部隊': row.issuing_unit,
          '受領先部隊': row.receiving_unit,
          '内容': row.details,
          '記録者': row.recorder_name
        }))
      }

      const worksheet = XLSX.utils.json_to_sheet(excelData)
      
      worksheet['!cols'] = [
        { wch: 12 },
        { wch: 20 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 30 },
        { wch: 10 }
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '入出庫記録')

      const fileName = `暗号機器_管理記録簿_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)

      alert('✅ Excelファイルダウンロード完了!')
    } catch (error) {
      console.error('Excel download error:', error)
      alert('❌ Excelダウンロード中にエラーが発生しました。')
    }
  }

  // フォーム送信ハンドラー
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedSerial) {
      alert('機器を選択してください。')
      return
    }
    
    if (!receivingUnit) {
      alert('受領先部隊を選択してください。')
      return
    }
    
    if (issuingUnit === receivingUnit) {
      alert('発行元部隊と受領先部隊が同じです。位置移動が発生していません。')
      return
    }
    
    if (!details.trim()) {
      alert('内容(事由)を入力してください。')
      return
    }
    
    if (!recorderName.trim()) {
      alert('記録者氏名を入力してください。')
      return
    }

    const submitButton = document.querySelector('button[type="submit"]')
    submitButton.disabled = true
    submitButton.textContent = '処理中...'
    
    try {
      const { data: logData, error: logError } = await supabase
        .from('transaction_logs')
        .insert([{
          asset_id: selectedSerial,
          issuing_unit: issuingUnit,
          receiving_unit: receivingUnit,
          details: details,
          recorder_name: recorderName
        }])
        .select()
      
      if (logError) throw logError

      const { error: updateError } = await supabase
        .from('equipment_master')
        .update({
          current_location: receivingUnit,
          last_issuer: issuingUnit
        })
        .eq('id', selectedSerial)
      
      if (updateError) throw updateError

      const currentDate = new Date().toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Tokyo'
      })

      setPdfData({
        certificateNo: certificateNo,
        assetId: selectedSerial,
        issuingUnit: issuingUnit,
        receivingUnit: receivingUnit,
        details: details,
        recorderName: recorderName,
        recordDate: currentDate
      })

      const statusDiv = document.getElementById('status')
      statusDiv.className = 'mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg'
      statusDiv.innerHTML = `
        <p class="font-bold">✅ 入出庫記録完了!</p>
        <p class="mt-2">証明書番号: ${certificateNo}</p>
        <p>機器: ${selectedSerial}</p>
        <p>${issuingUnit} → ${receivingUnit}</p>
        <p class="mt-3 text-sm">下のボタンをクリックして証明書をダウンロードしてください。</p>
      `

      setSelectedEquipment('')
      setSerialList([])
      setSelectedSerial('')
      setIssuingUnit('')
      setReceivingUnit('')
      setDetails('')
      setRecorderName('')

      const nextNo = (parseInt(certificateNo) + 1).toString().padStart(4, '0')
      setCertificateNo(nextNo)

    } catch (error) {
      console.error('Error:', error)
      const statusDiv = document.getElementById('status')
      statusDiv.className = 'mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'
      statusDiv.innerHTML = `
        <p class="font-bold">❌ 処理中にエラーが発生</p>
        <p class="mt-2">${error.message}</p>
      `
    } finally {
      submitButton.disabled = false
      submitButton.textContent = '入出庫記録および証明書発行'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-8 pb-4 border-b-2">
            暗号機器入出庫証明書発行
          </h1>

          {/* Excelダウンロードボタン */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleExcelDownload}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              📊 全体管理記録簿ダウンロード (Excel)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 証明書番号 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                証明書番号
              </label>
              <input
                type="text"
                value={certificateNo}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            {/* 機器名選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                機器名
              </label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">機器を選択してください</option>
                {equipmentList.map(eq => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>

            {/* シリアル番号選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                機器シリアル番号
              </label>
              <select
                value={selectedSerial}
                onChange={(e) => setSelectedSerial(e.target.value)}
                disabled={!selectedEquipment}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">シリアル番号を選択してください</option>
                {serialList.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.id} (現在: {item.current_location})
                  </option>
                ))}
              </select>
            </div>

            {/* 発行元部隊 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                発行元部隊 (現在の位置)
              </label>
              <input
                type="text"
                value={issuingUnit}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            {/* 受領先部隊 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                受領先部隊
              </label>
              <select
                value={receivingUnit}
                onChange={(e) => setReceivingUnit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">受領先部隊を選択してください</option>
                {unitList.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* 内容(事由) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                内容 (事由)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="入出庫事由を入力してください"
              />
            </div>

            {/* 記録者氏名 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                記録者 (氏名)
              </label>
              <input
                type="text"
                value={recorderName}
                onChange={(e) => setRecorderName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="記録者氏名を入力してください"
              />
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              入出庫記録および証明書発行
            </button>
          </form>

          {/* ステータスメッセージ領域 */}
          <div id="status" className="mt-6 transition-all duration-300"></div>

          {/* PDFダウンロードボタン */}
          {pdfData && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handlePdfDownload}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
              >
                📥 証明書ダウンロード (PDF)
              </button>
            </div>
          )}

          {/* 非表示PDFテンプレート */}
          {pdfData && (
            <div style={{ position: 'absolute', left: '-9999px' }}>
              <PdfTemplate ref={pdfRef} data={pdfData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
