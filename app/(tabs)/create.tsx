import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { useApp } from '@/src/context/AppContext';
import { ActivityCategory } from '@/src/types';
import { colors } from '@/src/theme/colors';

export default function CreateScreen() {
  const { categories, createActivity } = useApp();
  const [category, setCategory] = useState<ActivityCategory>('Golf');
  const [title, setTitle] = useState('Need 1 more');
  const [dateLabel, setDateLabel] = useState('Saturday');
  const [timeLabel, setTimeLabel] = useState('2:40 PM');
  const [location, setLocation] = useState('Cary');
  const [privateLocation, setPrivateLocation] = useState('');
  const [priceLabel, setPriceLabel] = useState('');
  const [spotsTotal, setSpotsTotal] = useState('4');
  const [approval, setApproval] = useState(true);

  const submit = () => {
    createActivity({ category, title: title || `Need people for ${category}`, dateLabel, timeLabel, publicLocation: location, privateLocation: privateLocation || undefined, priceLabel: priceLabel || undefined, spotsTotal: Math.max(2, Number(spotsTotal) || 4), visibility: 'friends_mutuals', joinMode: approval ? 'approval' : 'instant' });
    router.replace('/(tabs)/home');
  };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.heading}>Need people?</Text><Text style={styles.sub}>Post the open spot in under a minute.</Text>
    <Text style={styles.label}>Activity</Text><View style={styles.wrap}>{categories.map(c => <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, category===c && styles.chipActive]}><Text style={[styles.chipText, category===c && styles.chipTextActive]}>{c}</Text></Pressable>)}</View>
    <Field label="Post title" value={title} setValue={setTitle} placeholder="Need 1 for golf" />
    <View style={styles.row}><View style={{flex:1}}><Field label="Day" value={dateLabel} setValue={setDateLabel} /></View><View style={{flex:1}}><Field label="Time" value={timeLabel} setValue={setTimeLabel} /></View></View>
    <Field label="Public location" value={location} setValue={setLocation} placeholder="Cary" />
    <Field label="Exact location (unlocks after acceptance)" value={privateLocation} setValue={setPrivateLocation} placeholder="Optional" />
    <View style={styles.row}><View style={{flex:1}}><Field label="Total spots" value={spotsTotal} setValue={setSpotsTotal} keyboardType="number-pad" /></View><View style={{flex:1}}><Field label="Cost" value={priceLabel} setValue={setPriceLabel} placeholder="$62/person" /></View></View>
    <Text style={styles.label}>Joining</Text><View style={styles.wrap}><Pressable onPress={() => setApproval(false)} style={[styles.chip, !approval && styles.chipActive]}><Text style={[styles.chipText, !approval && styles.chipTextActive]}>Instant claim</Text></Pressable><Pressable onPress={() => setApproval(true)} style={[styles.chip, approval && styles.chipActive]}><Text style={[styles.chipText, approval && styles.chipTextActive]}>Approval required</Text></Pressable></View>
    <Pressable onPress={submit} style={styles.button}><Text style={styles.buttonText}>Post open spot</Text></Pressable>
  </ScrollView></SafeAreaView>
}

function Field({label,value,setValue,placeholder,keyboardType}:{label:string;value:string;setValue:(v:string)=>void;placeholder?:string;keyboardType?:'number-pad'}){
  return <View style={{marginBottom:14}}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={setValue} placeholder={placeholder} keyboardType={keyboardType} style={styles.input} /></View>
}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.bg},content:{padding:20,paddingBottom:120},heading:{fontSize:34,fontWeight:'900',color:colors.text,marginTop:10},sub:{fontSize:16,color:colors.muted,marginTop:6,marginBottom:22},label:{fontSize:13,fontWeight:'800',color:colors.text,marginBottom:7},wrap:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:18},chip:{paddingHorizontal:13,paddingVertical:10,borderRadius:999,backgroundColor:'#ECEAE4'},chipActive:{backgroundColor:colors.text},chipText:{fontWeight:'700',color:colors.muted},chipTextActive:{color:'#fff'},input:{backgroundColor:'#fff',borderColor:colors.line,borderWidth:1,borderRadius:14,paddingHorizontal:14,paddingVertical:13,fontSize:16},row:{flexDirection:'row',gap:12},button:{backgroundColor:colors.accent,borderRadius:16,padding:16,alignItems:'center',marginTop:10},buttonText:{color:'#fff',fontWeight:'900',fontSize:16}})
