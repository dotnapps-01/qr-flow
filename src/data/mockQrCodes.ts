export interface QrCode {
  id: string;
  name: string;
  type: 'Static' | 'Dynamic';
  createdAt: string;
  editedAt: string;
  state: 'Active' | 'Paused';
  scans: number;
  isFavorite: boolean;
  isScheduled: boolean;
  url: string;
  folderId?: string;
}

export const mockQrCodes: QrCode[] = [
  {
    id: '1',
    name: 'Homepage Redirect',
    type: 'Dynamic',
    createdAt: '2023-10-01',
    editedAt: '2023-10-05',
    state: 'Active',
    scans: 12450,
    isFavorite: true,
    isScheduled: false,
    url: 'https://example.com'
  },
  {
    id: '2',
    name: 'Summer Campaign',
    type: 'Dynamic',
    createdAt: '2023-09-15',
    editedAt: '2023-09-15',
    state: 'Active',
    scans: 830,
    isFavorite: false,
    isScheduled: true,
    url: 'https://example.com/summer'
  },
  {
    id: '3',
    name: 'Business Card - John',
    type: 'Static',
    createdAt: '2023-08-20',
    editedAt: '2023-08-20',
    state: 'Active',
    scans: 45,
    isFavorite: false,
    isScheduled: false,
    url: 'https://vcard.example.com/john'
  },
  {
    id: '4',
    name: 'Promo Code App',
    type: 'Dynamic',
    createdAt: '2023-07-10',
    editedAt: '2023-07-12',
    state: 'Paused',
    scans: 5600,
    isFavorite: true,
    isScheduled: false,
    url: 'https://app.example.com/promo'
  },
  {
    id: '5',
    name: 'Wi-Fi Guest Network',
    type: 'Static',
    createdAt: '2023-06-05',
    editedAt: '2023-06-05',
    state: 'Active',
    scans: 0,
    isFavorite: false,
    isScheduled: false,
    url: 'WIFI:S:GuestNetwork;T:WPA;P:guestpass;;'
  },
  {
    id: '6',
    name: 'Product Manual PDF',
    type: 'Dynamic',
    createdAt: '2023-05-18',
    editedAt: '2023-09-01',
    state: 'Active',
    scans: 120,
    isFavorite: false,
    isScheduled: false,
    url: 'https://example.com/manual.pdf'
  },
  {
    id: '7',
    name: 'Secret Sale',
    type: 'Dynamic',
    createdAt: '2023-10-10',
    editedAt: '2023-10-10',
    state: 'Active',
    scans: 5,
    isFavorite: true,
    isScheduled: true,
    url: 'https://example.com/secret'
  }
];
