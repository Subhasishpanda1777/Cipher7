-- Migration: Add enhanced screening metrics and normalized scores
-- Purpose: Store detailed screening analysis data with normalized risk scores

ALTER TABLE screenings ADD COLUMN IF NOT EXISTS alignment_deviation_score NUMERIC(5,4);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS alignment_symmetry_ratio NUMERIC(5,4);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS alignment_normalized NUMERIC(5,4);

ALTER TABLE screenings ADD COLUMN IF NOT EXISTS tracking_stability_score NUMERIC(5,4);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS tracking_normalized NUMERIC(5,4);

ALTER TABLE screenings ADD COLUMN IF NOT EXISTS contrast_sensitivity_score NUMERIC(5,4);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS contrast_normalized NUMERIC(5,4);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS contrast_left_eye_accuracy NUMERIC(5,2);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS contrast_right_eye_accuracy NUMERIC(5,2);

ALTER TABLE screenings ADD COLUMN IF NOT EXISTS final_risk_score_normalized NUMERIC(5,4);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS risk_classification VARCHAR(20);

-- Add metadata columns
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS screening_duration_seconds INTEGER;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS camera_quality_score NUMERIC(5,2);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS data_completeness_percentage NUMERIC(5,2);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_screenings_child_id_created_at ON screenings(child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_screenings_risk_classification ON screenings(risk_classification);
