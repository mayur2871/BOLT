import React, { useState } from 'react';
import { useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { Truck, Package, MapPin, Calendar, DollarSign, FileText, Clock, Send } from 'lucide-react';
import { InputField } from './InputField';
import { SelectField } from './SelectField';
import { TextAreaField } from './TextAreaField';
import { useTransportRecords } from '../hooks/useTransportRecords';
import { useSavedOptions } from '../hooks/useSavedOptions';
import { transformFormDataToUppercase } from '../utils/textTransform';
import { getDaysDifference } from '../utils/dateUtils';

interface TransportRecordFormProps {
  onRecordAdded?: () => void;
}

interface FormValues {
  srno: string;
  smsdate: string;
  lrdate: string;
  biltyno: string;
  truckno: string;
  transport: string;
  destination: string;
  weight: string;
  rate: string;
  total: string;
  biltycharge: string;
  freightamount: string;
  advance: string;
  advancedate: string;
  commission: string;
  balpaidamount: string;
  balpaiddate: string;
  netamount: string;
  isbalpaid: string;
  dateofreach: string;
  dateofunload: string;
  dayinhold: string;
  holdingcharge: string;
  totalholdingamount: string;
  courierdate: string;
}

const initialFormValues: FormValues = {
  srno: '',
  smsdate: '',
  lrdate: '',
  biltyno: '',
  truckno: '',
  transport: '',
  destination: '',
  weight: '',
  rate: '',
  total: '',
  biltycharge: '',
  freightamount: '',
  advance: '',
  advancedate: '',
  commission: '',
  balpaidamount: '',
  balpaiddate: '',
  netamount: '',
  isbalpaid: 'NO',
  dateofreach: '',
  dateofunload: '',
  dayinhold: '',
  holdingcharge: '',
  totalholdingamount: '',
  courierdate: ''
};

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

export function TransportRecordForm({ onRecordAdded }: TransportRecordFormProps) {
  const { addRecord, records } = useTransportRecords();
  const { savedTrucks, savedTransports, addTruck, addTransport } = useSavedOptions();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: any) => {
    setSubmitting(true);

    try {
      const transformedData = transformFormDataToUppercase(values);
      await addRecord(transformedData);
      
      // Reset form
      resetForm();
      
      // Notify parent component
      onRecordAdded?.();
      
      alert('TRANSPORT RECORD ADDED SUCCESSFULLY!');
    } catch (error) {
      console.error('Error adding record:', error);
      alert('FAILED TO ADD TRANSPORT RECORD. PLEASE TRY AGAIN.');
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
      initialValues={{
        ...initialFormValues,
        srno: records.length > 0 
          ? (Math.max(...records.map(r => parseInt(r.srno || '0')).filter(n => !isNaN(n))) + 1).toString()
          : '1'
      }}
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
          const lumpSumAllocated = 0; // New records don't have lump sum allocations yet
          
          const netAmount = freightAmount - balancePaid - commission - advance - lumpSumAllocated;
          
          setFieldValue('netamount', netAmount.toString());
        }, [values.freightamount, values.total, values.balpaidamount, values.commission, values.advance, setFieldValue]);

        // Auto-calculate Days in Hold (LR Date to Date of Unload)
        useEffect(() => {
          if (values.lrdate && values.dateofunload) {
            const days = getDaysDifference(values.smsdate, values.lrdate) + getDaysDifference(values.dateofreach, values.dateofunload);
            setFieldValue('dayinhold', days.toString());
          }
        }, [values.lrdate, values.dateofunload, values.smsdate, values.dateofreach, setFieldValue]);

        // Auto-calculate Total Holding Amount (Days in Hold × Holding Charge)
        useEffect(() => {
          const daysInHold = parseFloat(values.dayinhold) || 0;
          const holdingCharge = parseFloat(values.holdingcharge) || 0;
          const totalHoldingAmount = daysInHold * holdingCharge;
          
          setFieldValue('totalholdingamount', totalHoldingAmount.toString());
        }, [values.dayinhold, values.holdingcharge, setFieldValue]);

        return (
          <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-8">
              <Truck className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">Transport Record Entry</h1>
            </div>

            <Form className="space-y-8">
              {/* Basic Information */}
              <div className="form-section">
                <h3>
                  <FileText className="w-5 h-5 mr-2" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputField
                    label="SR NO"
                    name="srno"
                    value={values.srno}
                    onChange={(value) => setFieldValue('srno', value)}
                    onBlur={handleBlur}
                    placeholder="Enter serial number"
                    readOnly={true}
                    error={errors.srno}
                    touched={touched.srno}
                  />
                  <InputField
                    label="SMS Date / Plant Reach Date"
                    name="smsdate"
                    value={values.smsdate}
                    onChange={(value) => setFieldValue('smsdate', value)}
                    onBlur={handleBlur}
                    type="date"
                    error={errors.smsdate}
                    touched={touched.smsdate}
                  />
                  <InputField
                    label="LR Date"
                    name="lrdate"
                    value={values.lrdate}
                    onChange={(value) => setFieldValue('lrdate', value)}
                    onBlur={handleBlur}
                    type="date"
                    error={errors.lrdate}
                    touched={touched.lrdate}
                  />
                  <InputField
                    label="Bilty No"
                    name="biltyno"
                    value={values.biltyno}
                    onChange={(value) => setFieldValue('biltyno', value)}
                    onBlur={handleBlur}
                    placeholder="Enter bilty number"
                    error={errors.biltyno}
                    touched={touched.biltyno}
                  />
                </div>
              </div>

              {/* Transport Details */}
              <div className="form-section">
                <h3>
                  <Truck className="w-5 h-5 mr-2" />
                  Transport Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SelectField
                    label="Truck No"
                    name="truckno"
                    value={values.truckno}
                    onChange={(value) => setFieldValue('truckno', value)}
                    onBlur={handleBlur}
                    options={savedTrucks}
                    placeholder="Select or enter truck number"
                    allowCustom={true}
                    onAddNew={handleAddTruck}
                    error={errors.truckno}
                    touched={touched.truckno}
                  />
                  <SelectField
                    label="Transport"
                    name="transport"
                    value={values.transport}
                    onChange={(value) => setFieldValue('transport', value)}
                    onBlur={handleBlur}
                    options={savedTransports}
                    placeholder="Select or enter transport name"
                    allowCustom={true}
                    onAddNew={handleAddTransport}
                    required
                    error={errors.transport}
                    touched={touched.transport}
                  />
                  <InputField
                    label="Destination"
                    name="destination"
                    value={values.destination}
                    onChange={(value) => setFieldValue('destination', value)}
                    onBlur={handleBlur}
                    placeholder="Enter destination"
                    required
                    error={errors.destination}
                    touched={touched.destination}
                  />
                </div>
              </div>

              {/* Weight & Rate Information */}
              <div className="form-section">
                <h3>
                  <Package className="w-5 h-5 mr-2" />
                  Weight & Rate Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputField
                    label="Weight"
                    name="weight"
                    value={values.weight}
                    onChange={(value) => setFieldValue('weight', value)}
                    onBlur={handleBlur}
                    placeholder="Enter weight"
                    required
                    error={errors.weight}
                    touched={touched.weight}
                  />
                  <InputField
                    label="Rate"
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
                    label="Total"
                    name="total"
                    value={values.total}
                    onChange={(value) => setFieldValue('total', value)}
                    onBlur={handleBlur}
                    type="number"
                    placeholder="Enter total amount"
                    required
                    readOnly={values.rate.toUpperCase() !== 'FIX'}
                    error={errors.total}
                    touched={touched.total}
                  />
                  <InputField
                    label="Bilty Charge"
                    name="biltycharge"
                    value={values.biltycharge}
                    onChange={(value) => setFieldValue('biltycharge', value)}
                    onBlur={handleBlur}
                    type="number"
                    placeholder="Enter bilty charge"
                    error={errors.biltycharge}
                    touched={touched.biltycharge}
                  />
                </div>
              </div>

              {/* Financial Information */}
              <div className="form-section">
                <h3>
                  <DollarSign className="w-5 h-5 mr-2" />
                  Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputField
                    label="Freight Amount"
                    name="freightamount"
                    value={((parseFloat(values.total) || 0) - (parseFloat(values.biltycharge) || 0)).toString()}
                    onChange={(value) => setFieldValue('freightamount', value)}
                    onBlur={handleBlur}
                    type="number"
                    readOnly={true}
                    placeholder="Freight amount"
                    error={errors.freightamount}
                    touched={touched.freightamount}
                  />
                  <InputField
                    label="Advance"
                    name="advance"
                    value={values.advance}
                    onChange={(value) => setFieldValue('advance', value)}
                    onBlur={handleBlur}
                    type="number"
                    placeholder="Enter advance amount"
                    required
                    error={errors.advance}
                    touched={touched.advance}
                  />
                  <InputField
                    label="Advance Date"
                    name="advancedate"
                    value={values.advancedate}
                    onChange={(value) => setFieldValue('advancedate', value)}
                    onBlur={handleBlur}
                    type="date"
                    error={errors.advancedate}
                    touched={touched.advancedate}
                  />
                  <InputField
                    label="Commission"
                    name="commission"
                    value={values.commission}
                    onChange={(value) => setFieldValue('commission', value)}
                    onBlur={handleBlur}
                    type="number"
                    placeholder="Enter commission"
                    required
                    error={errors.commission}
                    touched={touched.commission}
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div className="form-section">
                <h3>
                  <DollarSign className="w-5 h-5 mr-2" />
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputField
                    label="Balance Paid Amount"
                    name="balpaidamount"
                    value={values.balpaidamount}
                    onChange={(value) => setFieldValue('balpaidamount', value)}
                    onBlur={handleBlur}
                    type="number"
                    placeholder="Enter balance paid amount"
                    error={errors.balpaidamount}
                    touched={touched.balpaidamount}
                  />
                  <InputField
                    label="Balance Paid Date"
                    name="balpaiddate"
                    value={values.balpaiddate}
                    onChange={(value) => setFieldValue('balpaiddate', value)}
                    onBlur={handleBlur}
                    type="date"
                    error={errors.balpaiddate}
                    touched={touched.balpaiddate}
                  />
                  <InputField
                    label="Net Amount"
                    name="netamount"
                    value={values.netamount}
                    onChange={(value) => setFieldValue('netamount', value)}
                    onBlur={handleBlur}
                    type="number"
                    placeholder="Enter net amount"
                    readOnly={true}
                    error={errors.netamount}
                    touched={touched.netamount}
                  />
                  <SelectField
                    label="Is Balance Paid"
                    name="isbalpaid"
                    value={values.isbalpaid}
                    onChange={(value) => setFieldValue('isbalpaid', value)}
                    onBlur={handleBlur}
                    options={['YES', 'NO']}
                    required
                    error={errors.isbalpaid}
                    touched={touched.isbalpaid}
                  />
                </div>
              </div>

              {/* Delivery Information */}
              <div className="form-section">
                <h3>
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputField
                    label="Date of Reach"
                    name="dateofreach"
                    value={values.dateofreach}
                    onChange={(value) => setFieldValue('dateofreach', value)}
                    onBlur={handleBlur}
                    type="date"
                    error={errors.dateofreach}
                    touched={touched.dateofreach}
                  />
                  <InputField
                    label="Date of Unload"
                    name="dateofunload"
                    value={values.dateofunload}
                    onChange={(value) => setFieldValue('dateofunload', value)}
                    onBlur={handleBlur}
                    type="date"
                    error={errors.dateofunload}
                    touched={touched.dateofunload}
                  />
                  <InputField
                    label="Days in Hold"
                    name="dayinhold"
                    value={values.dayinhold}
                    onChange={(value) => setFieldValue('dayinhold', value)}
                    onBlur={handleBlur}
                    type="number"
                    placeholder="TOTAL DAYS IN HOLD AT LODING AND UNLOADING POINT"
                    readOnly={true}
                    error={errors.dayinhold}
                    touched={touched.dayinhold}
                  />
                  <InputField
                    label="Courier Date"
                    name="courierdate"
                    value={values.courierdate}
                    onChange={(value) => setFieldValue('courierdate', value)}
                    onBlur={handleBlur}
                    type="date"
                    error={errors.courierdate}
                    touched={touched.courierdate}
                  />
                </div>
              </div>

              {/* Holding Charges */}
              <div className="form-section">
                <h3>
                  <Clock className="w-5 h-5 mr-2" />
                  Holding Charges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Holding Charge"
                    name="holdingcharge"
                    value={values.holdingcharge}
                    onChange={(value) => setFieldValue('holdingcharge', value)}
                    onBlur={handleBlur}
                    type="number"
                    placeholder="Enter holding charge per day"
                    error={errors.holdingcharge}
                    touched={touched.holdingcharge}
                  />
                  <InputField
                    label="Total Holding Amount"
                    name="totalholdingamount"
                    value={values.totalholdingamount}
                    onChange={(value) => setFieldValue('totalholdingamount', value)}
                    onBlur={handleBlur}
                    type="number"
                    placeholder="Enter total holding amount"
                    readOnly={true}
                    error={errors.totalholdingamount}
                    touched={touched.totalholdingamount}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmitting ? 'ADDING RECORD...' : 'ADD TRANSPORT RECORD'}</span>
                </button>
              </div>
            </Form>
          </div>
        );
      }}
    </Formik>
  );
}