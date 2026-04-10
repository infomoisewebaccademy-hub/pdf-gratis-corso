import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';

export const PresenceTracker: React.FC<{ user: UserProfile | null }> = ({ user }) => {
  const location = useLocation();
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const newChannel = supabase.channel('online-users');
    
    newChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setChannel(newChannel);
      }
    });

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, []);

  useEffect(() => {
    if (channel) {
      channel.track({
        user_id: user?.id,
        email: user?.email,
        full_name: user?.full_name,
        path: location.pathname + location.search,
        timestamp: new Date().toISOString(),
      });
    }
  }, [channel, user, location.pathname, location.search]);

  return null;
};
