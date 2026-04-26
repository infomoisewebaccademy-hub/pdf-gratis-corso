
-- Table for personal course notes
CREATE TABLE IF NOT EXISTS course_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  content TEXT NOT NULL, -- Will store HTML from rich text editor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE course_notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notes" ON course_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON course_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON course_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_course_notes_updated_at
    BEFORE UPDATE ON course_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
