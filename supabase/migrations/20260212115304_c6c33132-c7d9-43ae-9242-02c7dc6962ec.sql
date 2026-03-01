
-- Create overtime plans table for admin to plan future overtime
CREATE TABLE public.overtime_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  planned_start_time TIME NOT NULL,
  planned_end_time TIME NOT NULL,
  planned_hours NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Planned',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.overtime_plans ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth in this app)
CREATE POLICY "Allow all operations on overtime_plans"
ON public.overtime_plans
FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_overtime_plans_updated_at
BEFORE UPDATE ON public.overtime_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
