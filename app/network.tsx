import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/src/context/AppContext';
import { colors } from '@/src/theme/colors';

export default function NetworkScreen() {
  const { users, currentUserId, friendIds, mutualCount, addFriend } = useApp();
  const friends = users.filter(u => friendIds.includes(u.id));
  const mutuals = users.filter(u => u.id !== currentUserId && !friendIds.includes(u.id) && mutualCount(u.id) > 0);

  return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={24} color={colors.text}/></Pressable>
        <Text style={s.heading}>Your network</Text>
      </View>
      <Text style={s.sub}>Friends are your first layer. Mutuals are people one connection away.</Text>

      <Text style={s.section}>Friends</Text>
      {friends.map(user => <Person key={user.id} name={user.name} username={user.username} initials={user.initials} detail="Friend" />)}

      <Text style={s.section}>Mutuals</Text>
      {mutuals.length === 0 ? <Text style={s.empty}>No mutuals left to add.</Text> : mutuals.map(user => <Person key={user.id} name={user.name} username={user.username} initials={user.initials} detail={`${mutualCount(user.id)} mutuals`} action="Add friend" onPress={() => addFriend(user.id)} />)}
    </ScrollView>
  </SafeAreaView>
}

function Person({name,username,initials,detail,action,onPress}:{name:string;username:string;initials:string;detail:string;action?:string;onPress?:()=>void}){
  return <View style={s.person}>
    <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
    <View style={{flex:1}}><Text style={s.name}>{name}</Text><Text style={s.meta}>@{username} · {detail}</Text></View>
    {action ? <Pressable onPress={onPress} style={s.addButton}><Text style={s.addButtonText}>{action}</Text></Pressable> : null}
  </View>
}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.bg},content:{padding:20,paddingBottom:60},header:{flexDirection:'row',alignItems:'center',gap:8,marginTop:8},back:{width:38,height:38,borderRadius:19,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.line},heading:{fontSize:30,fontWeight:'900',color:colors.text},sub:{color:colors.muted,fontSize:15,lineHeight:22,marginTop:10},section:{fontSize:17,fontWeight:'900',color:colors.text,marginTop:26,marginBottom:10},person:{backgroundColor:'#fff',borderRadius:16,borderWidth:1,borderColor:colors.line,padding:13,flexDirection:'row',alignItems:'center',gap:11,marginBottom:9},avatar:{width:42,height:42,borderRadius:21,backgroundColor:colors.text,alignItems:'center',justifyContent:'center'},avatarText:{color:'#fff',fontWeight:'900'},name:{fontSize:15,fontWeight:'900',color:colors.text},meta:{fontSize:12,color:colors.muted,marginTop:3},addButton:{backgroundColor:colors.accent,borderRadius:999,paddingHorizontal:13,paddingVertical:8},addButtonText:{color:'#fff',fontSize:12,fontWeight:'900'},empty:{color:colors.muted}})
