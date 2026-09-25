import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { useApp } from '@/src/context/AppContext';
import { ActivityCategory, Visibility } from '@/src/types';
import { colors } from '@/src/theme/colors';

type AudienceChoice = 'friends' | 'all' | string;

export default function CreateScreen() {
  const { categories, createActivity, groups } = useApp();
  const [category, setCategory] = useState<ActivityCategory>('Golf');
  const [title, setTitle] = useState('Need 1 more');
  const [dateLabel, setDateLabel] = useState('Saturday');
  const [timeLabel, setTimeLabel] = useState('2:40 PM');
  const [location, setLocation] = useState('Cary');
  const [privateLocation, setPrivateLocation] = useState('');
  const [priceLabel, setPriceLabel] = useState('');
  const [spotsTotal, setSpotsTotal] = useState('4');
  const [approval, setApproval] = useState(true);
  const [audience, setAudience] = useState<AudienceChoice>('all');

  const submit = () => {
    const isCustomGroup = audience !== 'friends' && audience !== 'all';
    const visibility: Visibility = isCustomGroup ? 'group' : audience === 'friends' ? 'friends' : 'friends_mutuals';
    createActivity({
      category,
      title: title || `Need people for ${category}`,
      dateLabel,
      timeLabel,
      publicLocation: location,
      privateLocation: privateLocation || undefined,
      priceLabel: priceLabel || undefined,
      spotsTotal: Math.max(2, Number(spotsTotal) || 4),
      visibility,
      audienceGroupId: isCustomGroup ? audience : undefined,
      joinMode: approval ? 'approval' : 'instant',
    });
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

    <Text style={styles.label}>Who should see this?</Text>
    <View style={styles.audienceList}>
      <AudienceOption title="Friends" subtitle="Everyone you're friends with on I'm Down" selected={audience === 'friends'} onPress={() => setAudience('friends')} />
      <AudienceOption title="All" subtitle="Friends + first-degree mutuals" selected={audience === 'all'} onPress={() => setAudience('all')} />
      {groups.map(group => <AudienceOption key={group.id} title={group.name} subtitle={`${group.memberIds.length} friend${group.memberIds.length === 1 ? '' : 's'}`} selected={audience === group.id} onPress={() => setAudience(group.id)} />)}
    </View>

    <Text style={styles.label}>Joining</Text><View style={styles.wrap}><Pressable onPress={() => setApproval(false)} style={[styles.chip, !approval && styles.chipActive]}><Text style={[styles.chipText, !approval && styles.chipTextActive]}>Instant claim</Text></Pressable><Pressable onPress={() => setApproval(true)} style={[styles.chip, approval && styles.chipActive]}><Text style={[styles.chipText, approval && styles.chipTextActive]}>Approval required</Text></Pressable></View>
    <Pressable onPress={submit} style={styles.button}><Text style={styles.buttonText}>Post open spot</Text></Pressable>
  </ScrollView></SafeAreaView>
}

function AudienceOption({title,subtitle,selected,onPress}:{title:string;subtitle:string;selected:boolean;onPress:()=>void}){
  return <Pressable onPress={onPress} style={[styles.audienceCard, selected && styles.audienceCardActive]}>
    <View style={{flex:1}}><Text style={styles.audienceTitle}>{title}</Text><Text style={styles.audienceSub}>{subtitle}</Text></View>
    <View style={[styles.radio, selected && styles.radioActive]}>{selected ? <View style={styles.radioDot}/> : null}</View>
  </Pressable>
}

function Field({label,value,setValue,placeholder,keyboardType}:{label:string;value:string;setValue:(v:string)=>void;placeholder?:string;keyboardType?:'number-pad'}){
  return <View style={{marginBottom:14}}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={setValue} placeholder={placeholder} keyboardType={keyboardType} style={styles.input} /></View>
}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.bg},content:{padding:20,paddingBottom:120},heading:{fontSize:34,fontWeight:'900',color:colors.text,marginTop:10},sub:{fontSize:16,color:colors.muted,marginTop:6,marginBottom:22},label:{fontSize:13,fontWeight:'800',color:colors.text,marginBottom:7},wrap:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:18},chip:{paddingHorizontal:13,paddingVertical:10,borderRadius:999,backgroundColor:'#ECEAE4'},chipActive:{backgroundColor:colors.text},chipText:{fontWeight:'700',color:colors.muted},chipTextActive:{color:'#fff'},input:{backgroundColor:'#fff',borderColor:colors.line,borderWidth:1,borderRadius:14,paddingHorizontal:14,paddingVertical:13,fontSize:16},row:{flexDirection:'row',gap:12},button:{backgroundColor:colors.accent,borderRadius:16,padding:16,alignItems:'center',marginTop:10},buttonText:{color:'#fff',fontWeight:'900',fontSize:16},audienceList:{gap:9,marginBottom:20},audienceCard:{backgroundColor:'#fff',borderWidth:1,borderColor:colors.line,borderRadius:15,padding:14,flexDirection:'row',alignItems:'center',gap:12},audienceCardActive:{borderColor:colors.accent,backgroundColor:colors.accentSoft},audienceTitle:{fontWeight:'900',fontSize:15,color:colors.text},audienceSub:{fontSize:12,color:colors.muted,marginTop:3},radio:{width:22,height:22,borderRadius:11,borderWidth:2,borderColor:colors.line,alignItems:'center',justifyContent:'center'},radioActive:{borderColor:colors.accent},radioDot:{width:10,height:10,borderRadius:5,backgroundColor:colors.accent}})
