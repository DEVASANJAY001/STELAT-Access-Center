-- Workers Master Table
CREATE TABLE public.workers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id TEXT NOT NULL UNIQUE,
    worker_name TEXT NOT NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    shift TEXT NOT NULL,
    date_of_joining DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily Attendance Table
CREATE TABLE public.attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Leave')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(worker_id, date)
);

-- Briefing Meeting Attendance Table
CREATE TABLE public.briefing_attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(worker_id, date)
);

-- Overtime/Stay Back Table
CREATE TABLE public.overtime (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    hours_worked DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for now, no auth required)
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime ENABLE ROW LEVEL SECURITY;

-- Public access policies (for simplicity, allowing all operations)
CREATE POLICY "Allow all operations on workers" ON public.workers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on briefing_attendance" ON public.briefing_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on overtime" ON public.overtime FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_workers_updated_at
    BEFORE UPDATE ON public.workers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_briefing_attendance_updated_at
    BEFORE UPDATE ON public.briefing_attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_overtime_updated_at
    BEFORE UPDATE ON public.overtime
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();