import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { useApp } from '@/src/context/AppContext';
import { colors } from '@/src/theme/colors';

export default function ActivityDetail(){
  const { id } = useLocalSearchParams<{id:string}>();
  const { activities, getUser, relationshipLabel, currentUserId, joinActivity, requestActivity, spotsLeft } = useApp();
  const a = activities.find(x=>x.id===id);
  if(!a) return <SafeAreaView style={s.safe}><Text>Activity not found.</Text></SafeAreaView>;
  const host=getUser(a.hostId); const joined=a.memberIds.includes(currentUserId); const requested=a.requestedIds.includes(currentUserId); const left=spotsLeft(a);
  const fullLocation = joined || a.hostId===currentUserId ? (a.privateLocation || a.publicLocation) : a.publicLocation;
  const act=()=> a.joinMode==='instant'?joinActivity(a.id):requestActivity(a.id);
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}>
    <Pressable onPress={()=>router.back()} style={s.back}><Ionicons name="chevron-back" size={24}/></Pressable>
    <Text style={s.category}>{a.category.toUpperCase()}</Text><Text style={s.title}>{a.title}</Text><View style={s.pill}><Text style={s.pillText}>{left===0?'Full':`${left} spot${left===1?'':'s'} left`}</Text></View>
    <View style={s.card}><Row icon="calendar-outline" text={`${a.dateLabel} · ${a.timeLabel}`}/><Row icon="location-outline" text={fullLocation}/>{a.priceLabel&&<Row icon="card-outline" text={a.priceLabel}/>}</View>
    <Text style={s.section}>Host</Text><View style={s.host}><View style={s.avatar}><Text style={s.avatarText}>{host?.initials}</Text></View><View><Text style={s.hostName}>{host?.name}</Text><Text style={s.muted}>{relationshipLabel(a.hostId)}</Text></View></View>
    {a.description&&<><Text style={s.section}>Details</Text><Text style={s.desc}>{a.description}</Text></>}
    <Text style={s.section}>Going</Text><View style={s.members}>{a.memberIds.map(uid=>{const u=getUser(uid);return <View key={uid} style={s.member}><View style={s.smallAvatar}><Text style={s.smallAvatarText}>{u?.initials}</Text></View><Text style={s.memberText}>{u?.name}</Text></View>})}</View>
    {a.hostId!==currentUserId && <Pressable disabled={joined||requested||left===0} onPress={act} style={[s.button,(joined||requested||left===0)&&s.buttonDisabled]}><Text style={s.buttonText}>{joined?'You’re in':requested?'Request sent':left===0?'Full':a.joinMode==='instant'?'Claim spot':'Request spot'}</Text></Pressable>}
    {joined && a.privateLocation && <Text style={s.unlock}>Exact meetup details unlocked.</Text>}
  </ScrollView></SafeAreaView>
}
function Row({icon,text}:{icon:keyof typeof Ionicons.glyphMap;text:string}){return <View style={s.row}><Ionicons name={icon} size={20} color={colors.accent}/><Text style={s.rowText}>{text}</Text></View>}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.bg},content:{padding:20,paddingBottom:80},back:{width:42,height:42,borderRadius:21,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.line,marginBottom:18},category:{fontWeight:'900',letterSpacing:1.4,color:colors.accent,fontSize:12},title:{fontSize:32,fontWeight:'900',lineHeight:38,marginTop:8,color:colors.text},pill:{alignSelf:'flex-start',backgroundColor:colors.accentSoft,paddingHorizontal:12,paddingVertical:7,borderRadius:999,marginTop:13},pillText:{color:colors.accent,fontWeight:'900'},card:{backgroundColor:'#fff',borderWidth:1,borderColor:colors.line,borderRadius:18,padding:16,marginTop:22,gap:14},row:{flexDirection:'row',alignItems:'center',gap:10},rowText:{fontSize:16,fontWeight:'700',color:colors.text},section:{fontSize:17,fontWeight:'900',marginTop:26,marginBottom:12},host:{flexDirection:'row',alignItems:'center',gap:12},avatar:{width:52,height:52,borderRadius:26,backgroundColor:colors.text,alignItems:'center',justifyContent:'center'},avatarText:{color:'#fff',fontWeight:'900'},hostName:{fontWeight:'900',fontSize:17},muted:{color:colors.muted,marginTop:2},desc:{fontSize:16,color:colors.muted,lineHeight:23},members:{gap:10},member:{flexDirection:'row',alignItems:'center',gap:9},smallAvatar:{width:34,height:34,borderRadius:17,backgroundColor:'#E9E7E0',alignItems:'center',justifyContent:'center'},smallAvatarText:{fontWeight:'900',color:colors.text},memberText:{fontWeight:'700'},button:{backgroundColor:colors.accent,borderRadius:16,padding:16,alignItems:'center',marginTop:30},buttonDisabled:{backgroundColor:'#A8B2AB'},buttonText:{color:'#fff',fontWeight:'900',fontSize:16},unlock:{textAlign:'center',color:colors.accent,fontWeight:'700',marginTop:12}})
