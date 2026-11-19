'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doctorSchema, type DoctorValues } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type DoctorFormProps = {
  defaultValues?: Partial<DoctorValues>;
  onSubmit: (values: DoctorValues) => Promise<void> | void;
  submitLabel?: string;
  loading?: boolean;
};

export function DoctorForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save doctor',
  loading,
}: DoctorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      specialization: '',
      hospital: '',
      phone: '',
      email: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full name" error={errors.name?.message} {...register('name')} />
      <Input
        label="Specialization"
        error={errors.specialization?.message}
        {...register('specialization')}
      />
      <Input label="Hospital" error={errors.hospital?.message} {...register('hospital')} />
      <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
