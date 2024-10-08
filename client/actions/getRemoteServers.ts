'use server';

export const getIceServers = async () => {
  const response = await fetch(process.env.ICE_SERVERS);
  const iceServers = await response.json();
  return iceServers;
}
