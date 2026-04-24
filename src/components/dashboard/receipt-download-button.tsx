"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, Sprout, IndianRupee, User } from 'lucide-react';
import { Job, PricingPreset } from '@/lib/types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReceiptDownloadButtonProps {
  job: Job;
  preset: PricingPreset | undefined;
  workerId?: string; // Optional: If provided, generates a Salary Voucher for this worker
  workerName?: string;
}

export function ReceiptDownloadButton({ job, preset, workerId, workerName }: ReceiptDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const isWorkerMode = !!workerId;
  
  // Calculate stats based on mode
  const actualTrees = job.workerHarvestReports 
    ? (workerId 
        ? (job.workerHarvestReports[workerId]?.trees || 0)
        : Object.values(job.workerHarvestReports).reduce((sum, r) => sum + r.trees, 0))
    : job.treeCount;

  const totalAmount = isWorkerMode 
    ? actualTrees * (preset?.workerPayPerTree || 0)
    : actualTrees * (preset?.totalPricePerTree || 0);

  const paymentInfo = workerId ? job.workerPaymentStatuses?.[workerId] : null;
  const settledDate = isWorkerMode ? paymentInfo?.paidAt : job.settledAt;
  const method = isWorkerMode ? paymentInfo?.method : job.paymentMethod;

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    
    setIsGenerating(true);
    try {
      const element = receiptRef.current;
      element.style.display = 'block';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = isWorkerMode 
        ? `Salary-${workerName}-${job.customerName}.pdf`
        : `Invoice-${job.customerName}.pdf`;
        
      pdf.save(fileName);
      
      element.style.display = 'none';
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleDownload} 
        disabled={isGenerating}
        className="text-primary hover:bg-primary/10 transition-all active:scale-90"
        title={isWorkerMode ? "Download Salary Slip" : "Download Bill"}
      >
        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      </Button>

      {/* Hidden Receipt Template */}
      <div 
        ref={receiptRef} 
        style={{ 
          display: 'none', 
          position: 'fixed', 
          top: '-9999px', 
          left: '-9999px',
          width: '210mm',
          padding: '20mm',
          backgroundColor: 'white',
          color: 'black',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #EB7619', paddingBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#EB7619', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '8px' }}>
                <Sprout style={{ color: 'white', width: '24px', height: '24px' }} />
              </div>
              <h1 style={{ margin: 0, fontSize: '28px', color: '#111' }}>Cocofy</h1>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Coconut Harvest & Logistics Management</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#111' }}>
              {isWorkerMode ? 'SALARY VOUCHER' : 'INVOICE / RECEIPT'}
            </h2>
            <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>Date: {new Date().toLocaleDateString()}</p>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#666' }}>Ref: #{job.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
          <div>
            <h3 style={{ fontSize: '14px', color: '#EB7619', textTransform: 'uppercase', marginBottom: '10px' }}>
              {isWorkerMode ? 'Worker Details' : 'Customer Details'}
            </h3>
            <p style={{ margin: '0 0 5px', fontSize: '16px', fontWeight: 'bold' }}>{isWorkerMode ? workerName : job.customerName}</p>
            <p style={{ margin: '0 0 5px', fontSize: '14px' }}>{isWorkerMode ? `Worker ID: ${workerId?.slice(0,8)}` : job.customerPhone}</p>
            <p style={{ margin: '0 0 5px', fontSize: '14px' }}>{isWorkerMode ? 'Harvesting Personnel' : job.location}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '14px', color: '#EB7619', textTransform: 'uppercase', marginBottom: '10px' }}>
              {isWorkerMode ? 'Disbursement Summary' : 'Job Summary'}
            </h3>
            <p style={{ margin: '0 0 5px', fontSize: '14px' }}>Job Site: <strong>{job.customerName}</strong></p>
            <p style={{ margin: '0 0 5px', fontSize: '14px' }}>Date: {new Date(job.scheduledDate).toLocaleDateString()}</p>
            <p style={{ margin: '0 0 5px', fontSize: '14px' }}>Trees Logged: <strong>{actualTrees}</strong></p>
            <p style={{ margin: '0 0 5px', fontSize: '14px' }}>Status: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{isWorkerMode ? 'DISBURSED' : job.paymentStatus?.replace('_', ' ').toUpperCase()}</span></p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '13px', color: '#666' }}>Description</th>
              <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '13px', color: '#666' }}>Volume</th>
              <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '13px', color: '#666' }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '13px', color: '#666' }}>Net Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '15px 0', fontSize: '14px' }}>
                {isWorkerMode ? 'Labor Charges - Harvesting' : 'Coconut Harvesting Service'}
              </td>
              <td style={{ padding: '15px 0', fontSize: '14px', textAlign: 'center' }}>{actualTrees} Trees</td>
              <td style={{ padding: '15px 0', fontSize: '14px', textAlign: 'right' }}>
                ₹{isWorkerMode ? preset?.workerPayPerTree : preset?.totalPricePerTree}
              </td>
              <td style={{ padding: '15px 0', fontSize: '14px', textAlign: 'right' }}>₹{totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '2px solid #111', marginTop: '10px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {isWorkerMode ? 'Salary Paid' : 'Total Amount Paid'}
              </span>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#EB7619' }}>₹{totalAmount.toLocaleString()}</span>
            </div>
            <p style={{ textAlign: 'right', fontSize: '11px', color: '#666', marginTop: '5px' }}>
              Method: {method?.toUpperCase()}
              {settledDate && ` | Settled on: ${new Date(settledDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        {/* Payment Proof Attachments (Digital Evidence) */}
        {(isWorkerMode ? paymentInfo?.proof : (job.paymentScreenshot || (job.paymentScreenshots && job.paymentScreenshots.length > 0))) && (
          <div style={{ borderTop: '1px dashed #ccc', paddingTop: '30px' }}>
            <h3 style={{ fontSize: '14px', color: '#EB7619', textTransform: 'uppercase', marginBottom: '20px' }}>Digital Payment Evidence</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              {isWorkerMode ? (
                paymentInfo?.proof && (
                  <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Transaction Proof</p>
                    <img src={paymentInfo.proof} style={{ width: '100%', borderRadius: '4px', objectFit: 'contain', maxHeight: '250px' }} />
                  </div>
                )
              ) : (
                <>
                  {job.paymentScreenshot && (
                    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Legacy Proof</p>
                      <img src={job.paymentScreenshot} style={{ width: '100%', borderRadius: '4px', objectFit: 'contain', maxHeight: '250px' }} />
                    </div>
                  )}
                  {job.paymentScreenshots?.map((src, idx) => (
                    <div key={idx} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Payment Proof #{idx + 1}</p>
                      <img src={src} style={{ width: '100%', borderRadius: '4px', objectFit: 'contain', maxHeight: '250px' }} />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: '50px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <p style={{ fontSize: '12px', color: '#999' }}>Thank you for your service to Cocofy. This is a computer-generated voucher.</p>
        </div>
      </div>
    </>
  );
}
