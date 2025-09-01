import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { X, Save, Truck } from 'lucide-react';
import { InputField } from './InputField';
import { SelectField } from './SelectField';
import { useTransportRecords } from '../hooks/useTransportRecords';
import { useSavedOptions } from '../hooks/useSavedOptions';
import { transformFormDataToUppercase } from '../utils/textTransform';
import { getDaysDifference } from '../utils/dateUtils';
import type { Database } from '../lib/supabase';
import { convertDDMMYYYYToISO } from '../utils/dateUtils';

type TransportRecord = Database['public']['Tables']['transport_records']['Row'];

interface EditRecordModalProps {
  record: TransportRecord;
  onClose: () => void;
  onSave: () => void;
}

const validationSchema = yup.object().shape({
  truckno: yup.string()
    .matches(/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/, 'INVALID TRUCK NUMBER FORMAT (E.G., GJ01AB1234)')
    .required('TRUCK NUMBER IS REQUIRED'),
  transport: yup.string().required('TRANSPORT IS REQUIRED'),
  destination: yup.string().required('DESTINATION IS REQUIRED'),
  weight: yup.string().required('WEIGHT IS REQUIRED'),
  rate: yup.string().required('RATE IS REQUIRED'),
  total: yup.string().required('TOTAL IS REQUIRED'),
  advance: yup.string().required('ADVANCE IS REQUIRED'),
  commission: yup.string().required('COMMISSION IS REQUIRED'),
  isbalpaid: yup.string().required('PAYMENT STATUS IS REQUIRED'),
});

export function EditRecordModal({ record, onClose, onSave }: EditRecordModalProps) {
 
const initialValues = {
  srno: record.srno || '',
  smsdate: convertDDMMYYYYToISO(record.smsdate),
  lrdate: convertDDMMYYYYToISO(record.lrdate),
  biltyno: record.biltyno || '',
  truckno: record.truckno || '',
  transport: record.transport || '',
  destination: record.destination || '',
  weight: record.weight || '',
  rate: record.rate || '',
  total: record.total || '',
  biltycharge: record.biltycharge || '',
  freightamount: record.freightamount || '',
  advance: record.advance || '',
  advancedate: convertDDMMYYYYToISO(record.advancedate),
  commission: record.commission || '',
  balpaidamount: record.balpaidamount || '',
  balpaiddate: convertDDMMYYYYToISO(record.balpaiddate),
  netamount: record.netamount || '',
  isbalpaid: record.isbalpaid || 'NO',
  dateofreach: convertDDMMYYYYToISO(record.dateofreach),
  dateofunload: convertDDMMYYYYToISO(record.dateofunload),
  dayinhold: record.dayinhold || '',
  holdingcharge: record.holdingcharge || '',
  totalholdingamount: record.totalholdingamount || '',
  courierdate: convertDDMMYYYYToISO(record.courierdate)
};


  
  const { updateRecord } = useTransportRecords();
  const { savedTrucks, savedTransports, addTruck, addTransport } = useSavedOptions();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setSubmitting(true);

    try {
      const transformedData = transformFormDataToUppercase(values);
      await updateRecord(record.id, transformedData);
      alert('RECORD UPDATED SUCCESSFULLY!');
      onSave();
    } catch (error) {
      console.error('Error updating record:', error);
      alert('FAILED TO UPDATE RECORD. PLEASE TRY AGAIN.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTruck = async (truckNo: string) => {
    try {
      await addTruck(truckNo);
    } catch (error) {
      console.error('Error adding truck:', error);
    }
  };

  const handleAddTransport = async (transportName: string) => {
    try {
      await addTransport(transportName);
    } catch (error) {
      console.error('Error adding transport:', error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }) => {
        // Auto-calculate Total Amount (Weight × Rate)
        useEffect(() => {
          // Only auto-calculate if rate is not "FIX"
          if (values.rate.toUpperCase() === 'FIX') {
            return; // Don't auto-calculate, allow manual input
          }
          
          const weight = parseFloat(values.weight) || 0;
          const rate = parseFloat(values.rate) || 0;
          const total = weight * rate;
          
          if (total > 0) {
            setFieldValue('total', total.toString());
          } else if (values.rate && isNaN(parseFloat(values.rate))) {
            // If rate is not a number and not empty, clear the total for manual input
            setFieldValue('total', '');
          }
        }, [values.weight, values.rate, setFieldValue]);

        // Auto-calculate Net Amount (Freight Amount - Balance Paid - Commission - Advance)
        useEffect(() => {
          const freightAmount = parseFloat(values.freightamount) || parseFloat(values.total) || 0;
          const balancePaid = parseFloat(values.balpaidamount) || 0;
          const commission = parseFloat(values.commission) || 0;
          const advance = parseFloat(values.advance) || 0;
          const lumpSumAllocated = parseFloat(record.lump_sum_allocated_amount?.toString() || '0');
          
          const netAmount = freightAmount - balancePaid - commission - advance - lumpSumAllocated;
          
          setFieldValue('netamount', netAmount.toString());
        }, [values.freightamount, values.total, values.balpaidamount, values.commission, values.advance, record.lump_sum_allocated_amount, setFieldValue]);

        // Auto-calculate Days in Hold (LR Date to Date of Unload)
        useEffect(() => {
          if (values.lrdate && values.dateofunload) {
            const days = getDaysDifference(values.lrdate, values.dateofunload);
            setFieldValue('dayinhold', days.toString());
          }
        }, [values.lrdate, values.dateofunload, setFieldValue]);

        // Auto-calculate Total Holding Amount (Days in Hold × Holding Charge)
        useEffect(() => {
          const daysInHold = parseFloat(values.dayinhold) || 0;
          const holdingCharge = parseFloat(values.holdingcharge) || 0;
          const totalHoldingAmount = daysInHold * holdingCharge;
          
          setFieldValue('totalholdingamount', totalHoldingAmount.toString());
        }, [values.dayinhold, values.holdingcharge, setFieldValue]);

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Truck className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">EDIT TRANSPORT RECORD</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <Form className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="form-section">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">BASIC INFORMATION</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputField
                      label="SR NO"
                      name="srno"
                      value={values.srno}
                      onChange={(value) => setFieldValue('srno', value)}
                      onBlur={handleBlur}
                      readOnly={true}
                      error={errors.srno}
                      touched={touched.srno}
                    />
                    <InputField
                      label="SMS DATE"
                      name="smsdate"
                      value={values.smsdate}
                      onChange={(value) => setFieldValue('smsdate', value)}
                      onBlur={handleBlur}
                      type="date"
                      error={errors.smsdate}
                      touched={touched.smsdate}
                    />
                    <InputField
                      label="LR DATE"
                      name="lrdate"
                      value={values.lrdate}
                      onChange={(value) => setFieldValue('lrdate', value)}
                      onBlur={handleBlur}
                      type="date"
                      error={errors.lrdate}
                      touched={touched.lrdate}
                    />
                    <InputField
                      label="BILTY NO"
                      name="biltyno"
                      value={values.biltyno}
                      onChange={(value) => setFieldValue('biltyno', value)}
                      onBlur={handleBlur}
                      error={errors.biltyno}
                      touched={touched.biltyno}
                    />
                  </div>
                </div>

                {/* Transport Details */}
                <div className="form-section">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">TRANSPORT DETAILS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SelectField
                      label="TRUCK NO"
                      name="truckno"
                      value={values.truckno}
                      onChange={(value) => setFieldValue('truckno', value)}
                      onBlur={handleBlur}
                      options={savedTrucks}
                      allowCustom={true}
                      onAddNew={handleAddTruck}
                      error={errors.truckno}
                      touched={touched.truckno}
                    />
                    <SelectField
                      label="TRANSPORT"
                      name="transport"
                      value={values.transport}
                      onChange={(value) => setFieldValue('transport', value)}
                      onBlur={handleBlur}
                      options={savedTransports}
                      allowCustom={true}
                      onAddNew={handleAddTransport}
                      required
                      error={errors.transport}
                      touched={touched.transport}
                    />
                    <InputField
                      label="DESTINATION"
                      name="destination"
                      value={values.destination}
                      onChange={(value) => setFieldValue('destination', value)}
                      onBlur={handleBlur}
                      required
                      error={errors.destination}
                      touched={touched.destination}
                    />
                  </div>
                </div>

                {/* Financial Information */}
                <div className="form-section">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">FINANCIAL INFORMATION</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputField
                      label="WEIGHT"
                      name="weight"
                      value={values.weight}
                      onChange={(value) => setFieldValue('weight', value)}
                      onBlur={handleBlur}
                      required
                      error={errors.weight}
                      touched={touched.weight}
                    />
                    <InputField
                      label="RATE"
                      name="rate"
                      value={values.rate}
                      onChange={(value) => setFieldValue('rate', value)}
                      onBlur={handleBlur}
                      type="text"
                      placeholder="Enter rate or FIX"
                      required
                      error={errors.rate}
                      touched={touched.rate}
                    />
                    <InputField
                      label="TOTAL"
                      name="total"
                      value={values.total}
                      onChange={(value) => setFieldValue('total', value)}
                      onBlur={handleBlur}
                      placeholder="Total amount"
                      required
                      readOnly={values.rate.toUpperCase() !== 'FIX'}
                      error={errors.total}
                      touched={touched.total}
                    />
                    <InputField
                      label="ADVANCE"
                      name="advance"
                      value={values.advance}
                      onChange={(value) => setFieldValue('advance', value)}
                      onBlur={handleBlur}
                      type="number"
                      required
                      error={errors.advance}
                      touched={touched.advance}
                    />
                  </div>
                </div>

                {/* Payment Status */}
                <div className="form-section">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">PAYMENT STATUS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SelectField
                      label="IS BALANCE PAID"
                      name="isbalpaid"
                      value={values.isbalpaid}
                      onChange={(value) => setFieldValue('isbalpaid', value)}
                      onBlur={handleBlur}
                      options={['YES', 'NO']}
                      required
                      error={errors.isbalpaid}
                      touched={touched.isbalpaid}
                    />
                    <InputField
                      label="BALANCE PAID AMOUNT"
                      name="balpaidamount"
                      value={values.balpaidamount}
                      onChange={(value) => setFieldValue('balpaidamount', value)}
                      onBlur={handleBlur}
                      type="number"
                      error={errors.balpaidamount}
                      touched={touched.balpaidamount}
                    />
                    <InputField
                      label="BALANCE PAID DATE"
                      name="balpaiddate"
                      value={values.balpaiddate}
                      onChange={(value) => setFieldValue('balpaiddate', value)}
                      onBlur={handleBlur}
                      type="date"
                      error={errors.balpaiddate}
                      touched={touched.balpaiddate}
                    />
                    <InputField
                      label="NET AMOUNT"
                      name="netamount"
                      value={values.netamount}
                      onChange={(value) => setFieldValue('netamount', value)}
                      onBlur={handleBlur}
                      type="number"
                      readOnly={true}
                      error={errors.netamount}
                      touched={touched.netamount}
                    />
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="form-section">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">DELIVERY INFORMATION</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputField
                      label="DATE OF REACH"
                      name="dateofreach"
                      value={values.dateofreach}
                      onChange={(value) => setFieldValue('dateofreach', value)}
                      onBlur={handleBlur}
                      type="date"
                      error={errors.dateofreach}
                      touched={touched.dateofreach}
                    />
                    <InputField
                      label="DATE OF UNLOAD"
                      name="dateofunload"
                      value={values.dateofunload}
                      onChange={(value) => setFieldValue('dateofunload', value)}
                      onBlur={handleBlur}
                      type="date"
                      error={errors.dateofunload}
                      touched={touched.dateofunload}
                    />
                    <InputField
                      label="DAYS IN HOLD"
                      name="dayinhold"
                      value={values.dayinhold}
                      onChange={(value) => setFieldValue('dayinhold', value)}
                      onBlur={handleBlur}
                      type="number"
                      readOnly={true}
                      error={errors.dayinhold}
                      touched={touched.dayinhold}
                    />
                    <InputField
                      label="HOLDING CHARGE"
                      name="holdingcharge"
                      value={values.holdingcharge}
                      onChange={(value) => setFieldValue('holdingcharge', value)}
                      onBlur={handleBlur}
                      type="number"
                      error={errors.holdingcharge}
                      touched={touched.holdingcharge}
                    />
                    <InputField
                      label="TOTAL HOLDING AMOUNT"
                      name="totalholdingamount"
                      value={values.totalholdingamount}
                      onChange={(value) => setFieldValue('totalholdingamount', value)}
                      onBlur={handleBlur}
                      type="number"
                      readOnly={true}
                      error={errors.totalholdingamount}
                      touched={touched.totalholdingamount}
                    />
                  </div>
                </div>
              </Form>

              {/* Footer */}
              <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      }}
    </Formik>
  );
}