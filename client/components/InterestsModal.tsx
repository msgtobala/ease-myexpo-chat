import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface InterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Industry {
  id: string;
  name: string;
}

export default function InterestsModal({ isOpen, onClose }: InterestsModalProps) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchIndustries();
    }
  }, [isOpen]);

  const fetchIndustries = async () => {
    try {
      setLoading(true);
      const industriesCollection = collection(db, 'industries');
      const industriesSnapshot = await getDocs(industriesCollection);
      const industriesData: Industry[] = [];
      
      industriesSnapshot.forEach((doc) => {
        industriesData.push({
          id: doc.id,
          name: doc.data().name || doc.id
        });
      });
      
      setIndustries(industriesData);
    } catch (error) {
      console.error('Error fetching industries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIndustryToggle = (industryId: string) => {
    setSelectedIndustries(prev => {
      if (prev.includes(industryId)) {
        return prev.filter(id => id !== industryId);
      } else {
        return [...prev, industryId];
      }
    });
  };

  const handleSaveInterests = async () => {
    if (!user || selectedIndustries.length === 0) {
      toast({
        title: "Select Interests",
        description: "Please select at least one industry of interest.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Add selected industries to user's interests array
      await updateDoc(userDocRef, {
        interests: arrayUnion(...selectedIndustries)
      });

      toast({
        title: "Interests Added!",
        description: "Your interests have been successfully saved.",
      });

      onClose();
    } catch (error) {
      console.error('Error saving interests:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your interests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedIndustries([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] w-full max-w-[600px] mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-[20px] font-semibold text-[#212121] font-poppins">
            Select Your Interests
          </h2>
          <div className="w-8 h-8 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" fill="#10B981"/>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-[16px] text-[#666] font-poppins mb-2">
              To provide you with better matches, please select your areas of interest:
            </p>
            <p className="text-[14px] text-[#888] font-poppins">
              You can select multiple industries
            </p>
          </div>

          {/* Industries Grid */}
          <div className="mb-6">
            <label className="block text-[14px] font-medium text-[#212121] font-poppins mb-4">
              Select industries you're interested in *
            </label>
            
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-[12px] animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                {industries.map((industry) => (
                  <button
                    key={industry.id}
                    onClick={() => handleIndustryToggle(industry.id)}
                    className={`p-3 rounded-[12px] border-2 transition-all font-poppins text-[14px] text-left ${
                      selectedIndustries.includes(industry.id)
                        ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                        : 'border-gray-200 bg-white text-[#212121] hover:border-[#10B981]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{industry.name}</span>
                      {selectedIndustries.includes(industry.id) && (
                        <svg className="w-5 h-5 ml-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Count */}
          {selectedIndustries.length > 0 && (
            <div className="mb-4 p-3 bg-[#10B981]/10 rounded-[12px]">
              <p className="text-[14px] text-[#10B981] font-poppins">
                {selectedIndustries.length} interest{selectedIndustries.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleSaveInterests}
            disabled={selectedIndustries.length === 0 || saving}
            className="w-full px-4 py-3 bg-[#10B981] text-white rounded-[12px] font-poppins text-[14px] font-medium hover:bg-[#0ea574] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {saving ? 'Saving...' : 'Save Interests'}
          </button>
        </div>
      </div>
    </div>
  );
}
