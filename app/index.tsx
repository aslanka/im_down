import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useApp } from '@/src/context/AppContext';
import { colors } from '@/src/theme/colors';

export default function Index() {
  const { session, authReady } = useApp();
  if (!authReady) return <View style={{flex:1,backgroundColor:colors.bg,alignItems:'center',justifyContent:'center'}}><ActivityIndicator color={colors.accent}/></View>;
  return <Redirect href={session ? '/(tabs)/home' : '/auth'} />;
}
