import { Browser } from '@capacitor/browser';

export const openMap = async (
  latitude: number,
  longitude: number,
  label?: string
) => {
  const query = label
    ? `${latitude},${longitude} (${label})`
    : `${latitude},${longitude}`;

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  await Browser.open({
    url,
    presentationStyle: 'fullscreen',
  });
};

export const openMapByQuery = async (query: string) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  await Browser.open({
    url,
    presentationStyle: 'fullscreen',
  });
};
