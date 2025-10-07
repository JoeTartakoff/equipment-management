import React from 'react'

const PdfTemplate = React.forwardRef(({ data }, ref) => {
  return (
    <div ref={ref} style={{ 
      padding: '32px', 
      backgroundColor: '#ffffff',
      width: '210mm',
      minHeight: '297mm',
      fontFamily: 'Arial, sans-serif'
    }}>
      <style>{`
        @media print {
          @page { 
            size: A4; 
            margin: 20mm; 
          }
          body { 
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact; 
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        .pdf-container {
          color: #000000;
          background-color: #ffffff;
        }
        
        .pdf-border {
          border: 4px solid #1f2937;
          padding: 24px;
        }
        
        .pdf-title {
          font-size: 28px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #d1d5db;
        }
        
        .pdf-info-box {
          background-color: #f9fafb;
          padding: 16px;
          margin-bottom: 24px;
          border-radius: 4px;
        }
        
        .pdf-info-text {
          font-size: 13px;
          margin-bottom: 8px;
        }
        
        .pdf-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
        }
        
        .pdf-table th,
        .pdf-table td {
          border: 2px solid #1f2937;
          padding: 12px;
          text-align: left;
          vertical-align: middle;
        }
        
        .pdf-table thead th {
          background-color: #e5e7eb;
          font-weight: bold;
        }
        
        .pdf-table tbody th {
          background-color: #f3f4f6;
          width: 33.33%;
          font-weight: bold;
        }
        
        .pdf-signature {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 2px solid #6b7280;
        }
        
        .pdf-signature-title {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 16px;
        }
        
        .pdf-signature-area {
          display: flex;
          justify-content: space-around;
          gap: 32px;
        }
        
        .pdf-signature-box {
          flex: 1;
          text-align: center;
        }
        
        .pdf-sign-frame {
          border: 2px solid #9ca3af;
          height: 96px;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        
        .pdf-footer {
          margin-top: 32px;
          text-align: right;
        }
        
        .pdf-footer-text {
          margin-bottom: 8px;
        }
        
        .pdf-footer-date {
          font-weight: bold;
          font-size: 18px;
        }
      `}</style>
      
      <div className="pdf-container">
        <div className="pdf-border">
          <h1 className="pdf-title">
            暗号機器入出庫証明書
          </h1>

          <div className="pdf-info-box">
            <p className="pdf-info-text">
              <strong>証明書番号:</strong> {data.certificateNo}
            </p>
            <p className="pdf-info-text">
              <strong>記録日時:</strong> {data.recordDate}
            </p>
            <p className="pdf-info-text">
              上記暗号機器の入出庫記録が以下の通り正常に処理されたことを証明します。
            </p>
          </div>

          <table className="pdf-table">
            <thead>
              <tr>
                <th colSpan="2">
                  機器および入出庫情報
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>機器シリアル番号</th>
                <td>{data.assetId}</td>
              </tr>
              <tr>
                <th>発行元部隊 (以前の位置)</th>
                <td>{data.issuingUnit}</td>
              </tr>
              <tr>
                <th>受領先部隊 (現在の位置)</th>
                <td>{data.receivingUnit}</td>
              </tr>
              <tr>
                <th>内容 (事由)</th>
                <td>{data.details}</td>
              </tr>
              <tr>
                <th>記録者</th>
                <td>{data.recorderName}</td>
              </tr>
            </tbody>
          </table>

          <div className="pdf-signature">
            <div className="pdf-signature-title">確認および承認</div>
            
            <div className="pdf-signature-area">
              <div className="pdf-signature-box">
                <p style={{ marginBottom: '8px', fontWeight: '600' }}>発行元機関責任者</p>
                <p style={{ fontSize: '13px', marginBottom: '8px' }}>({data.issuingUnit})</p>
                <div className="pdf-sign-frame"></div>
                <p style={{ fontSize: '13px' }}>(署名/捺印)</p>
              </div>
              <div className="pdf-signature-box">
                <p style={{ marginBottom: '8px', fontWeight: '600' }}>受領先機関責任者</p>
                <p style={{ fontSize: '13px', marginBottom: '8px' }}>({data.receivingUnit})</p>
                <div className="pdf-sign-frame"></div>
                <p style={{ fontSize: '13px' }}>(署名/捺印)</p>
              </div>
            </div>
          </div>

          <div className="pdf-footer">
            <p className="pdf-footer-text">上記内容が事実に相違ないことを確認します。</p>
            <p className="pdf-footer-date">
              {new Date().getFullYear()}年 {new Date().getMonth() + 1}月 {new Date().getDate()}日
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

PdfTemplate.displayName = 'PdfTemplate'

export default PdfTemplate
