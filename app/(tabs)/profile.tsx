import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/src/context/AppContext';
import { colors } from '@/src/theme/colors';

export default function ProfileScreen(){
  const{getUser,currentUserId,activities,acceptRequest,friendIds,groups}=useApp();
  const me=getUser(currentUserId)!;
  const mine=activities.filter(a=>a.hostId===currentUserId);
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}>
    <View style={s.avatar}><Text style={s.avatarText}>{me.initials}</Text></View>
    <Text style={s.name}>{me.name}</Text><Text style={s.user}>@{me.username}</Text>
    <View style={s.stats}><View><Text style={s.num}>{mine.length}</Text><Text style={s.small}>posts</Text></View><View><Text style={s.num}>{friendIds.length}</Text><Text style={s.small}>friends</Text></View><View><Text style={s.num}>{groups.length}</Text><Text style={s.small}>groups</Text></View></View>

    <View style={s.actions}>
      <Pressable onPress={()=>router.push('/network')} style={s.action}><Ionicons name="people-outline" size={20} color={colors.accent}/><View style={{flex:1}}><Text style={s.actionTitle}>Friends & mutuals</Text><Text style={s.small}>Grow your trusted network</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted}/></Pressable>
      <Pressable onPress={()=>router.push('/groups')} style={s.action}><Ionicons name="albums-outline" size={20} color={colors.accent}/><View style={{flex:1}}><Text style={s.actionTitle}>Groups</Text><Text style={s.small}>Golf crew, poker group, and more</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted}/></Pressable>
    </View>

    <Text style={s.section}>Interests</Text><View style={s.wrap}>{me.interests.map(i=><View key={i} style={s.chip}><Text style={s.chipText}>{i}</Text></View>)}</View>
    <Text style={s.section}>Join requests</Text>{mine.flatMap(a=>a.requestedIds.map(uid=>({activity:a,user:getUser(uid)}))).map(({activity,user})=><View key={activity.id+user?.id} style={s.request}><View style={{flex:1}}><Text style={s.postTitle}>{user?.name} wants to join</Text><Text style={s.small}>{activity.title}</Text></View><Text onPress={()=>user&&acceptRequest(activity.id,user.id)} style={s.accept}>Accept</Text></View>)}
    <Text style={s.section}>Your open spots</Text>{mine.length===0?<Text style={s.empty}>You haven't posted anything yet.</Text>:mine.map(a=><View key={a.id} style={s.post}><Text style={s.postTitle}>{a.title}</Text><Text style={s.small}>{a.dateLabel} · {a.timeLabel}</Text></View>)}
  </ScrollView></SafeAreaView>
}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.bg},content:{padding:20,paddingBottom:120,alignItems:'center'},avatar:{width:86,height:86,borderRadius:43,backgroundColor:colors.text,alignItems:'center',justifyContent:'center',marginTop:20},avatarText:{color:'#fff',fontSize:28,fontWeight:'900'},name:{fontSize:28,fontWeight:'900',marginTop:13,color:colors.text},user:{color:colors.muted,marginTop:3},stats:{flexDirection:'row',gap:38,marginTop:24},num:{fontSize:22,fontWeight:'900',textAlign:'center'},small:{color:colors.muted,fontSize:13},actions:{alignSelf:'stretch',gap:9,marginTop:26},action:{backgroundColor:'#fff',borderWidth:1,borderColor:colors.line,borderRadius:16,padding:14,flexDirection:'row',alignItems:'center',gap:12},actionTitle:{fontWeight:'900',fontSize:15,color:colors.text},section:{alignSelf:'flex-start',fontSize:18,fontWeight:'900',marginTop:28,marginBottom:12},wrap:{alignSelf:'stretch',flexDirection:'row',flexWrap:'wrap',gap:8},chip:{backgroundColor:colors.accentSoft,paddingHorizontal:13,paddingVertical:9,borderRadius:999},chipText:{color:colors.accent,fontWeight:'800'},empty:{alignSelf:'flex-start',color:colors.muted},post:{alignSelf:'stretch',backgroundColor:'#fff',borderRadius:15,padding:14,borderWidth:1,borderColor:colors.line,marginBottom:9},postTitle:{fontWeight:'800',fontSize:15,marginBottom:4},request:{alignSelf:'stretch',backgroundColor:'#fff',borderRadius:15,padding:14,borderWidth:1,borderColor:colors.line,marginBottom:9,flexDirection:'row',alignItems:'center',gap:12},accept:{color:colors.accent,fontWeight:'900'}})
