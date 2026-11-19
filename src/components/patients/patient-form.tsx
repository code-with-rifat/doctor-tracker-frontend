'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { patientSchema, type PatientValues } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type PatientFormProps = {
  defaultValues?: Partial<PatientValues>;
  doctorOptions?: { label: string; value: string }[];
  showDoctorField?: boolean;
  onSubmit: (values: PatientValues) => Promise<void> | void;
  submitLabel?: string;
  loading?: boolean;
};

export function PatientForm({
  defaultValues,
  doctorOptions = [],
  showDoctorField = false,
  onSubmit,
  submitLabel = 'Save patient',
  loading,
}: PatientFormProps) {
  const schema = showDoctorField
    ? patientSchema.extend({
        doctor: z.string().min(1, 'Doctor is required'),
      })
    : patientSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      age: 30,
      gender: 'Male',
      phone: '',
      condition: '',
      status: 'Active',
      doctor: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full name" error={errors.name?.message} {...register('name')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Age"
          type="number"
          error={errors.age?.message}
          {...register('age')}
        />
        <Select
          label="Gender"
          error={errors.gender?.message}
          options={[
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Other', value: 'Other' },
          ]}
          {...register('gender')}
        />
      </div>
      <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
      <Input label="Condition" error={errors.condition?.message} {...register('condition')} />
      <Select
        label="Status"
        error={errors.status?.message}
        options={[
          { label: 'Active', value: 'Active' },
          { label: 'Discharged', value: 'Discharged' },
        ]}
        {...register('status')}
      />
      {showDoctorField ? (
        <Select
          label="Doctor"
          placeholder="Select doctor"
          error={errors.doctor?.message}
          options={doctorOptions}
          {...register('doctor')}
        />
      ) : null}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
