/**
 * Mock API Service for Mandates
 * GET /api/jobs/mandates
 */

export const fetchMandates = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock Data
  return [
    {
      id: 'm1',
      title: 'Senior Frontend Engineer',
      clientName: 'Google Asia',
      status: 'Active',
      department: 'Engineering',
      location: 'Singapore',
      workingMode: 'Hybrid',
      salaryRange: '$6,000 - $9,000',
      contact: 'hr-sg@google.com',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      openRoles: 3,
      totalRoles: 5,
      createdAt: new Date().toISOString(),
      pipeline: { screened: 12, interview: 5, offer: 2, hired: 2 }
    },
    {
      id: 'm2',
      title: 'Product Manager',
      clientName: 'Internal',
      status: 'Active',
      department: 'Product',
      location: 'Ho Chi Minh City',
      workingMode: 'On-site',
      salaryRange: '35,000,000 - 55,000,000 VND',
      contact: 'admin@hrlite.vn',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      openRoles: 1,
      totalRoles: 2,
      createdAt: new Date().toISOString(),
      pipeline: { screened: 8, interview: 2, offer: 1, hired: 1 }
    },
    {
      id: 'm3',
      title: 'UX Designer',
      clientName: 'Meta',
      status: 'On Hold',
      department: 'Design',
      location: 'Remote',
      workingMode: 'Remote',
      salaryRange: '$4,000 - $6,500',
      contact: 'design-recruitment@meta.com',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      openRoles: 1,
      totalRoles: 1,
      createdAt: new Date().toISOString(),
      pipeline: { screened: 15, interview: 4, offer: 0, hired: 0 }
    },
    {
      id: 'm4',
      title: 'Backend Lead',
      clientName: 'Amazon',
      status: 'Active',
      department: 'Engineering',
      location: 'Hanoi',
      workingMode: 'Hybrid',
      salaryRange: 'Negotiable',
      contact: 'tech-hiring@amazon.vn',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      openRoles: 2,
      totalRoles: 2,
      createdAt: new Date().toISOString(),
      pipeline: { screened: 20, interview: 6, offer: 0, hired: 0 }
    },
    {
      id: 'm5',
      title: 'Talent Acquisition',
      clientName: 'Internal',
      status: 'Closed',
      department: 'Human Resources',
      location: 'Ho Chi Minh City',
      workingMode: 'On-site',
      salaryRange: '20,000,000 - 30,000,000 VND',
      contact: 'careers@hrlite.vn',
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      openRoles: 0,
      totalRoles: 1,
      createdAt: new Date().toISOString(),
      pipeline: { screened: 45, interview: 12, offer: 1, hired: 1 }
    }
  ];
};

