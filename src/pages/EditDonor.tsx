
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DonorForm from '@/components/donors/DonorForm';
import { DonorForm as DonorFormType } from '@/types';
import { fetchDonorById, updateDonor } from '@/services/donorService';
import { ArrowLeft } from 'lucide-react';

export default function EditDonor() {
  const [donor, setDonor] = useState<DonorFormType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadDonor = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const donorData = await fetchDonorById(id);
        
        const donorForm: DonorFormType = {
          name: donorData.name,
          blood_group: donorData.blood_group,
          phone: donorData.phone,
          province: donorData.province,
          district: donorData.district,
          municipality: donorData.municipality,
        };
        
        setDonor(donorForm);
      } catch (error) {
        console.error('Error loading donor:', error);
        toast({
          title: 'Error',
          description: 'Failed to load donor details',
          variant: 'destructive',
        });
        navigate('/donors');
      } finally {
        setIsLoading(false);
      }
    };

    loadDonor();
  }, [id, navigate, toast]);

  const handleSubmit = async (data: DonorFormType) => {
    if (!id) return;
    
    try {
      setIsSaving(true);
      await updateDonor(id, data);
      
      toast({
        title: 'Donor Updated',
        description: 'Donor details have been updated successfully',
      });
      
      navigate('/donors');
    } catch (error) {
      console.error('Error updating donor:', error);
      toast({
        title: 'Error',
        description: 'Failed to update donor',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Donor</h2>
            <p className="text-muted-foreground">
              Update donor information
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/donors')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donors
          </Button>
        </div>

        <div className="border rounded-lg p-6 bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading donor details...</p>
            </div>
          ) : donor ? (
            <DonorForm 
              onSubmit={handleSubmit}
              initialData={donor}
              isLoading={isSaving}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p>Donor not found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
