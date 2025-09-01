import React from 'react';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { DollarSign, Building, Calendar, FileText, Save } from 'lucide-react';
import { InputField } from './InputField';
import { TextAreaField } from './TextAreaField';
import { useLumpSumPayments } from '../hooks/useLumpSumPayments';
import { transformFormDataToUppercase } from '../utils/textTransform';

interface LumpSumFormValues {
  company_name: string;
  amount: string;
  date_received: string;
  notes: string;
}

const initialValues: LumpSumFormValues = {
  company_name: '',
  amount: '',
  date_received: new Date().toISOString().split('T')[0],
  notes: ''
};

const validationSchema = yup.object().shape({
  company_name: yup.string().required('COMPANY NAME IS REQUIRED'),
  amount: yup.number()
    .positive('AMOUNT MUST BE POSITIVE')
    .required('AMOUNT IS REQUIRED'),
  date_received: yup.string().required('DATE RECEIVED IS REQUIRED'),
});

interface LumpSumEntryFormProps {
  onPaymentAdded?: () => void;
}

export function LumpSumEntryForm({ onPaymentAdded }: LumpSumEntryFormProps) {
  const { addLumpSumPayment } = useLumpSumPayments();

  const handleSubmit = async (values: LumpSumFormValues, { setSubmitting, resetForm }: any) => {
    setSubmitting(true);

    try {
      const transformedData = transformFormDataToUppercase(values);
      await addLumpSumPayment({
        company_name: transformedData.company_name,
        amount: parseFloat(transformedData.amount),
        date_received: transformedData.date_received,
        notes: transformedData.notes,
        remaining_balance: parseFloat(transformedData.amount)
      });
      
      resetForm();
      onPaymentAdded?.();
      alert('LUMP SUM PAYMENT RECORDED SUCCESSFULLY!');
    } catch (error) {
      console.error('Error adding lump sum payment:', error);
      alert('FAILED TO RECORD LUMP SUM PAYMENT. PLEASE TRY AGAIN.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-8">
        <DollarSign className="w-8 h-8 text-green-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">LUMP SUM PAYMENT ENTRY</h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue, handleBlur }) => (
          <Form className="space-y-8">
            {/* Payment Information */}
            <div className="form-section">
              <h3>
                <Building className="w-5 h-5 mr-2" />
                PAYMENT INFORMATION
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField
                  label="COMPANY NAME"
                  name="company_name"
                  value={values.company_name}
                  onChange={(value) => setFieldValue('company_name', value)}
                  onBlur={handleBlur}
                  placeholder="Enter transport company name"
                  required
                  error={errors.company_name}
                  touched={touched.company_name}
                />
                <InputField
                  label="AMOUNT RECEIVED"
                  name="amount"
                  value={values.amount}
                  onChange={(value) => setFieldValue('amount', value)}
                  onBlur={handleBlur}
                  type="number"
                  placeholder="Enter lump sum amount"
                  required
                  error={errors.amount}
                  touched={touched.amount}
                />
                <InputField
                  label="DATE RECEIVED"
                  name="date_received"
                  value={values.date_received}
                  onChange={(value) => setFieldValue('date_received', value)}
                  onBlur={handleBlur}
                  type="date"
                  required
                  error={errors.date_received}
                  touched={touched.date_received}
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="form-section">
              <h3>
                <FileText className="w-5 h-5 mr-2" />
                ADDITIONAL DETAILS
              </h3>
              <TextAreaField
                label="NOTES"
                value={values.notes}
                onChange={(value) => setFieldValue('notes', value)}
                placeholder="Enter any additional notes about this payment"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg"
              >
                <Save className="w-5 h-5" />
                <span>{isSubmitting ? 'RECORDING PAYMENT...' : 'RECORD LUMP SUM PAYMENT'}</span>
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}