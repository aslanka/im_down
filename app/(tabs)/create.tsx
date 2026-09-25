import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    createActivity({ category, title: title || `Need people for ${category}`, dateLabel, timeLabel, publicLocation: location, privateLocation: privateLocation || undefined, priceLabel: priceLabel || undefined, spotsTotal: Math.max(2, Number(spotsTotal) || 4), visibility, audienceGroupId: isCustomGroup ? audience : undefined, joinMode: approval ? 'approval' : 'instant' });
    router.replace('/(tabs)/home');
  };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.kicker}>CREATE</Text><Text style={styles.heading}>Need people?</Text><Text style={styles.sub}>Post the open spot in under a minute.</Text>
    <Text style={styles.label}>Activity</Text><View style={styles.wrap}>{categories.map(c => <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, category===c && styles.chipActive]}><Text style={[styles.chipText, category===c && styles.chipTextActive]}>{c}</Text></Pressable>)}</View>
    <Field label="Post title" value={title} setValue={setTitle} placeholder="Need 1 for golf" />
    <View style={styles.row}><View style={{flex:1}}><Field label="Day" value={dateLabel} setValue={setDateLabel} /></View><View style={{flex:1}}><Field label="Time" value={timeLabel} setValue={setTimeLabel} /></View></View>
    <Field label="Public location" value={location} setValue={setLocation} placeholder="Cary" />
    <Field label="Exact location" value={privateLocation} setValue={setPrivateLocation} placeholder="Unlocks after acceptance" />
    <View style={styles.row}><View style={{flex:1}}><Field label="Total spots" value={spotsTotal} setValue={setSpotsTotal} keyboardType="number-pad" /></View><View style={{flex:1}}><Field label="Cost" value={priceLabel} setValue={setPriceLabel} placeholder="$62/person" /></View></View>

    <Text style={styles.label}>Audience</Text>
    <View style={styles.audienceList}>
      <AudienceOption icon="people-outline" title="Friends" subtitle="Everyone you're friends with" selected={audience === 'friends'} onPress={() => setAudience('friends')} />
      <AudienceOption icon="git-network-outline" title="All" subtitle="Friends + first-degree mutuals" selected={audience === 'all'} onPress={() => setAudience('all')} />
      {groups.map(group => <AudienceOption key={group.id} icon="albums-outline" title={group.name} subtitle={`${group.memberIds.length} friend${group.memberIds.length === 1 ? '' : 's'}`} selected={audience === group.id} onPress={() => setAudience(group.id)} />)}
    </View>

    <Text style={styles.label}>Joining</Text><View style={styles.joinWrap}><Pressable onPress={() => setApproval(false)} style={[styles.joinChip, !approval && styles.joinChipActive]}><Ionicons name="flash-outline" size={16} color={!approval ? colors.accent : colors.muted}/><Text style={[styles.chipText, !approval && styles.chipTextActive]}>Instant claim</Text></Pressable><Pressable onPress={() => setApproval(true)} style={[styles.joinChip, approval && styles.joinChipActive]}><Ionicons name="shield-checkmark-outline" size={16} color={approval ? colors.accent : colors.muted}/><Text style={[styles.chipText, approval && styles.chipTextActive]}>Approval required</Text></Pressable></View>
    <Pressable onPress={submit} style={({pressed})=>[styles.button,pressed&&{opacity:.88}]}><Ionicons name="arrow-forward" size={19} color="#EAF2FF"/><Text style={styles.buttonText}>Post open spot</Text></Pressable>
  </ScrollView></SafeAreaView>
}

function AudienceOption({icon,title,subtitle,selected,onPress}:{icon:keyof typeof Ionicons.glyphMap;title:string;subtitle:string;selected:boolean;onPress:()=>void}){
  return <Pressable onPress={onPress} style={[styles.audienceCard, selected && styles.audienceCardActive]}><View style={[styles.audienceIcon,selected&&styles.audienceIconActive]}><Ionicons name={icon} size={18} color={selected ? colors.accent : colors.muted}/></View><View style={{flex:1}}><Text style={styles.audienceTitle}>{title}</Text><Text style={styles.audienceSub}>{subtitle}</Text></View><View style={[styles.radio, selected && styles.radioActive]}>{selected ? <View style={styles.radioDot}/> : null}</View></Pressable>
}

function Field({label,value,setValue,placeholder,keyboardType}:{label:string;value:string;setValue:(v:string)=>void;placeholder?:string;keyboardType?:'number-pad'}){
  return <View style={{marginBottom:14}}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={setValue} placeholder={placeholder} placeholderTextColor={colors.subtle} keyboardType={keyboardType} style={styles.input} /></View>
}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.bg},content:{paddingHorizontal:18,paddingTop:16,paddingBottom:120},kicker:{fontSize:11,fontWeight:'900',letterSpacing:2,color:colors.accent},heading:{fontSize:34,fontWeight:'900',color:colors.text,marginTop:6,letterSpacing:-.7},sub:{fontSize:15,color:colors.muted,marginTop:6,marginBottom:24},label:{fontSize:12,fontWeight:'900',letterSpacing:.3,color:colors.text,marginBottom:8},wrap:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:20},chip:{paddingHorizontal:13,paddingVertical:10,borderRadius:12,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.line},chipActive:{backgroundColor:colors.accentSoft,borderColor:'#244B89'},chipText:{fontWeight:'800',color:colors.muted,fontSize:13},chipTextActive:{color:'#DCE9FF'},input:{backgroundColor:colors.input,color:colors.text,borderColor:colors.line,borderWidth:1,borderRadius:15,paddingHorizontal:14,paddingVertical:13,fontSize:15},row:{flexDirection:'row',gap:10},button:{backgroundColor:colors.accentStrong,borderRadius:17,padding:16,alignItems:'center',justifyContent:'center',flexDirection:'row-reverse',gap:8,marginTop:12,shadowColor:'#245EFF',shadowOpacity:.25,shadowRadius:16,shadowOffset:{width:0,height:8}},buttonText:{color:'#EAF2FF',fontWeight:'900',fontSize:15},audienceList:{gap:9,marginBottom:22},audienceCard:{backgroundColor:colors.card,borderWidth:1,borderColor:colors.line,borderRadius:18,padding:13,flexDirection:'row',alignItems:'center',gap:11},audienceCardActive:{borderColor:'#244B89',backgroundColor:'#0F1D35'},audienceIcon:{width:38,height:38,borderRadius:12,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},audienceIconActive:{backgroundColor:colors.accentSoft},audienceTitle:{fontWeight:'900',fontSize:14,color:colors.text},audienceSub:{fontSize:12,color:colors.muted,marginTop:3},radio:{width:21,height:21,borderRadius:11,borderWidth:2,borderColor:colors.line,alignItems:'center',justifyContent:'center'},radioActive:{borderColor:colors.accent},radioDot:{width:9,height:9,borderRadius:5,backgroundColor:colors.accent},joinWrap:{gap:9,marginBottom:8},joinChip:{paddingHorizontal:13,paddingVertical:12,borderRadius:15,backgroundColor:colors.card,borderWidth:1,borderColor:colors.line,flexDirection:'row',alignItems:'center',gap:8},joinChipActive:{backgroundColor:colors.accentSoft,borderColor:'#244B89'}})
