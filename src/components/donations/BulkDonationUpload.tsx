import React, { useState } from "react";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createDonation } from "@/services/donationService";
import { fetchDonors } from "@/services/donorService";

export default function BulkDonationUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csvContent = [
      "donor_phone,donation_date,location,notes",
      "9841234567,2024-01-15,Central Blood Bank,Regular donation",
      "9851234567,2024-02-20,City Hospital,Emergency donation",
      "9861234567,2024-03-10,Red Cross Center,Voluntary donation"
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donation_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      // Validate headers
      const expectedHeaders = ['donor_phone', 'donation_date', 'location', 'notes'];
      const hasValidHeaders = expectedHeaders.every(header => 
        headers.includes(header)
      );

      if (!hasValidHeaders) {
        throw new Error('Invalid CSV format. Please use the template.');
      }

      // Get all donors to match by phone
      const donors = await fetchDonors();
      const donorMap = new Map(donors.map(d => [d.phone, d.id]));

      let successCount = 0;
      let errorCount = 0;

      // Process each line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',');
        const donorPhone = values[0]?.trim();
        const donationDate = values[1]?.trim();
        const location = values[2]?.trim();
        const notes = values[3]?.trim();

        const donorId = donorMap.get(donorPhone);
        
        if (!donorId) {
          console.warn(`Donor with phone ${donorPhone} not found`);
          errorCount++;
          continue;
        }

        try {
          await createDonation({
            donor_id: donorId,
            donation_date: donationDate,
            location: location || '',
            notes: notes || ''
          });
          successCount++;
        } catch (error) {
          console.error(`Error creating donation for ${donorPhone}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "Upload Complete",
        description: `Successfully imported ${successCount} donations. ${errorCount} errors.`,
      });

      setFile(null);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "Failed to process CSV file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Upload Donations
        </CardTitle>
        <CardDescription>
          Upload multiple donation records using a CSV file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <span className="text-sm text-muted-foreground">
            Download the CSV template first
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv-file">Upload CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <Button 
          onClick={handleFileUpload} 
          disabled={!file || isLoading}
          className="w-full"
        >
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Donations
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p><strong>CSV Format:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>donor_phone: Phone number of the donor</li>
            <li>donation_date: Date in YYYY-MM-DD format</li>
            <li>location: Where the donation took place</li>
            <li>notes: Additional notes (optional)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
