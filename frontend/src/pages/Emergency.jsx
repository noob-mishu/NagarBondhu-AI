import React from 'react'


const emergencyServices = [
  {
    id: 'national',
    name: 'জাতীয় জরুরি সেবা',
    nameEn: 'National Emergency',
    number: '999',
    description: 'পুলিশ, ফায়ার সার্ভিস, অ্যাম্বুলেন্স — সব এক নম্বরে',
    icon: Siren,
    gradient: 'from-red-600 to-rose-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    ring: 'ring-red-500/30',
    pulse: true,
  },
  {
    id: 'police',
    name: 'পুলিশ',
    nameEn: 'Police',
    number: '999',
    description: 'চুরি, ডাকাতি, সন্ত্রাসী কার্যকলাপ রিপোর্ট করুন',
    icon: Shield,
    gradient: 'from-blue-700 to-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    ring: 'ring-blue-500/30',
  },
  {
    id: 'fire',
    name: 'ফায়ার সার্ভিস',
    nameEn: 'Fire Service',
    number: '199',
    description: 'আগুন, গ্যাস লিক, উদ্ধার অপারেশনের জন্য কল করুন',
    icon: Flame,
    gradient: 'from-orange-600 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    ring: 'ring-orange-500/30',
  },
  {
    id: 'ambulance',
    name: 'অ্যাম্বুলেন্স',
    nameEn: 'Ambulance',
    number: '199',
    description: 'জরুরি চিকিৎসা সাহায্যের জন্য কল করুন',
    icon: Ambulance,
    gradient: 'from-emerald-600 to-green-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    ring: 'ring-emerald-500/30',
  },
];

const additionalNumbers = [
  { name: 'RAB (র‍্যাব)', number: '01৭৭৯-৫১১১৫' },
  { name: 'নারী ও শিশু নির্যাতন', number: '10921' },
  { name: 'দুর্নীতি দমন কমিশন', number: '106' },
  { name: 'তথ্য সেবা', number: '333' },
  { name: 'স্বাস্থ্য বাতায়ন', number: '16263' },
  { name: 'দুর্যোগ ব্যবস্থাপনা', number: '1090' },
];

const Emergency = () => {
  return (
    <div>Emergency</div>
  )
}

export default Emergency