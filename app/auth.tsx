import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/src/context/AppContext';
import { colors } from '@/src/theme/colors';

export default function AuthScreen() {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    if (!email.trim() || password.length < 6 || (mode === 'signup' && (!name.trim() || username.trim().length < 3))) {
      setMessage('Fill out all fields. Passwords must be at least 6 characters.');
      return;
    }
    setBusy(true); setMessage('');
    try {
      const result = mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, name, username);
      if (result) setMessage(result);
      else router.replace('/(tabs)/home');
    } catch (e: any) {
      setMessage(e?.message ?? 'Something went wrong.');
    } finally { setBusy(false); }
  };

  return <SafeAreaView style={s.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
    <View style={s.logo}><Ionicons name="people" size={28} color="#fff"/></View>
    <Text style={s.brand}>I'M DOWN</Text>
    <Text style={s.title}>{mode === 'signin' ? 'Welcome back.' : 'Build your circle.'}</Text>
    <Text style={s.sub}>{mode === 'signin' ? 'Sign in to see open spots from your network.' : 'Create an account and start filling the last spot.'}</Text>

    {mode === 'signup' && <>
      <TextInput value={name} onChangeText={setName} placeholder="Display name" placeholderTextColor={colors.muted} style={s.input}/>
      <TextInput value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="Username" placeholderTextColor={colors.muted} style={s.input}/>
    </>}
    <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={colors.muted} style={s.input}/>
    <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" placeholderTextColor={colors.muted} style={s.input}/>

    {!!message && <Text style={s.message}>{message}</Text>}
    <Pressable disabled={busy} onPress={submit} style={[s.button, busy && {opacity:.6}]}><Text style={s.buttonText}>{busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}</Text></Pressable>
    <Pressable onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); }} style={s.switch}>
      <Text style={s.switchText}>{mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}<Text style={{color:colors.accent,fontWeight:'900'}}>{mode === 'signin' ? 'Sign up' : 'Sign in'}</Text></Text>
    </Pressable>
  </ScrollView></SafeAreaView>
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.bg},content:{flexGrow:1,padding:24,justifyContent:'center'},
  logo:{width:58,height:58,borderRadius:18,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center',marginBottom:18},
  brand:{fontSize:12,letterSpacing:2.4,fontWeight:'900',color:colors.accent},title:{fontSize:38,lineHeight:43,fontWeight:'900',color:colors.text,marginTop:10},
  sub:{fontSize:16,lineHeight:23,color:colors.muted,marginTop:8,marginBottom:28},input:{backgroundColor:colors.card,borderWidth:1,borderColor:colors.line,borderRadius:16,paddingHorizontal:16,paddingVertical:15,color:colors.text,fontSize:16,marginBottom:11},
  message:{color:colors.muted,lineHeight:20,marginVertical:5},button:{backgroundColor:colors.accent,borderRadius:16,paddingVertical:16,alignItems:'center',marginTop:10},buttonText:{color:'#fff',fontWeight:'900',fontSize:16},
  switch:{alignItems:'center',paddingVertical:20},switchText:{color:colors.muted,fontSize:14}
});
