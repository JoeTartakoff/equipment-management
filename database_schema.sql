-- ============================================
-- 암호기기 관리 시스템 데이터베이스 스키마
-- ============================================

-- 테이블 1: 기기 마스터 리스트
CREATE TABLE equipment_master (
    id TEXT PRIMARY KEY,
    equipment_name TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    current_location TEXT NOT NULL,
    last_issuer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 테이블 2: 입출고 기록 로그
CREATE TABLE transaction_logs (
    certificate_no SERIAL PRIMARY KEY,
    record_datetime TIMESTAMP DEFAULT NOW(),
    asset_id TEXT NOT NULL,
    issuing_unit TEXT NOT NULL,
    receiving_unit TEXT NOT NULL,
    details TEXT NOT NULL,
    pdf_link TEXT,
    recorder_name TEXT NOT NULL
);
