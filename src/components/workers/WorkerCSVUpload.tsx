import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { useBulkCreateWorkers } from "@/hooks/useWorkers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface WorkerCSVUploadProps {
    onSuccess: () => void;
}

export function WorkerCSVUpload({ onSuccess }: WorkerCSVUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bulkCreate = useBulkCreateWorkers();

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        setProgress(10);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                setProgress(40);

                if (jsonData.length === 0) {
                    throw new Error("The uploaded file is empty.");
                }

                // Validate and transform data
                const workersToCreate = jsonData.map((row: any, index) => {
                    // Map headers (handle both space-separated and underscores)
                    const worker_id = row["Worker ID"] || row.worker_id;
                    const name = row["Name"] || row.worker_name;
                    const department = row["Department"] || row.department;
                    const designation = row["Designation"] || row.designation;
                    const shift = row["Shift"] || row.shift;
                    const statusInput = row["Status"] || row.status;
                    const joiningDateInput = row["Date of Joining"] || row.date_of_joining;

                    if (!worker_id || !name || !department || !designation || !shift) {
                        throw new Error(`Row ${index + 1} is missing required fields (Worker ID, Name, Department, Designation, Shift).`);
                    }

                    // Handle Date parsing (Image shows DD-MM-YYYY)
                    let date_of_joining = new Date().toISOString().split('T')[0];
                    if (joiningDateInput) {
                        if (typeof joiningDateInput === 'string' && joiningDateInput.includes('-')) {
                            const parts = joiningDateInput.split('-');
                            if (parts.length === 3) {
                                // If it looks like DD-MM-YYYY
                                if (parts[0].length <= 2 && parts[2].length === 4) {
                                    date_of_joining = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                                } else {
                                    date_of_joining = joiningDateInput;
                                }
                            }
                        } else if (typeof joiningDateInput === 'number') {
                            // Handle Excel serial date
                            const date = XLSX.SSF.parse_date_code(joiningDateInput);
                            date_of_joining = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
                        }
                    }

                    return {
                        worker_id: String(worker_id),
                        worker_name: String(name),
                        department: String(department),
                        designation: String(designation),
                        shift: String(shift),
                        date_of_joining,
                        status: (statusInput === "Inactive" ? "Inactive" : "Active") as "Active" | "Inactive",
                    };
                });

                setProgress(70);

                await bulkCreate.mutateAsync(workersToCreate);

                setProgress(100);
                setTimeout(() => {
                    onSuccess();
                }, 500);
            } catch (err: any) {
                setError(err.message || "Failed to parse file. Please ensure it's a valid CSV/Excel file.");
                setIsUploading(false);
            }
        };

        reader.onerror = () => {
            setError("Failed to read file.");
            setIsUploading(false);
        };

        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        const template = [
            {
                "Worker ID": "T676",
                "Name": "Ashrafali M",
                "Department": "Plant Qual",
                "Designation": "Operator",
                "Shift": "General",
                "Status": "Active",
                "Date of Joining": "07-09-2022"
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Workers Template");
        XLSX.writeFile(wb, "worker_import_template.xlsx");
    };

    return (
        <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-10 space-y-4 hover:border-primary/50 transition-colors bg-muted/5">
                <div className="bg-primary/10 p-4 rounded-full">
                    <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">CSV or Excel files only</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    Select File
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileUpload}
                />
            </div>

            {isUploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Uploading and processing...</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                </div>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!isUploading && !error && (
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm font-medium">Import Template</p>
                            <p className="text-xs text-muted-foreground">Download the template to ensure correct format</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={downloadTemplate} className="gap-2">
                        <Download className="w-4 h-4" /> Template
                    </Button>
                </div>
            )}

            <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg">
                <p className="font-medium mb-2">Instructions:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Required columns: Worker ID, Name, Department, Designation, Shift</li>
                    <li>Optional columns: Date of Joining (DD-MM-YYYY), Status (P/A)</li>
                    <li>Ensure worker IDs are unique</li>
                </ul>
            </div>
        </div>
    );
}
