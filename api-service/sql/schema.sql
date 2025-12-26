-- api-service/sql/schema.sql
CREATE TABLE IF NOT EXISTS import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id VARCHAR(255) NOT NULL,
    import_name VARCHAR(255) NOT NULL,
    max_images INT DEFAULT 10000,
    tags JSONB,
    status VARCHAR(50) DEFAULT 'QUEUED', -- QUEUED, PROCESSING, COMPLETED, FAILED
    total_images INT DEFAULT 0,
    imported_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_status ON import_jobs(status);

CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    google_drive_file_id VARCHAR(255),
    minio_bucket VARCHAR(100) DEFAULT 'images-prod',
    minio_object_key VARCHAR(500) NOT NULL,
    minio_url TEXT,
    public_url TEXT,
    size BIGINT,
    width INT,
    height INT,
    format VARCHAR(50),
    tags JSONB DEFAULT '[]',
    upload_status VARCHAR(50) DEFAULT 'SUCCESS',
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_job_id ON images(import_job_id);