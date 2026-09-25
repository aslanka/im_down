import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/src/context/AppContext';
import { colors } from '@/src/theme/colors';

export default function NetworkScreen() {
  const { users, currentUserId, friendIds, friendRequests, mutualCount, addFriend, respondFriendRequest } = useApp();
  const friends = users.filter(u => friendIds.includes(u.id));
  const mutuals = users.filter(u => u.id !== currentUserId && !friendIds.includes(u.id) && mutualCount(u.id) > 0 && !friendRequests.some(r => r.userId === u.id));

  return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={22} color={colors.text}/></Pressable>
        <View><Text style={s.kicker}>YOUR CIRCLE</Text><Text style={s.heading}>Network</Text></View>
      </View>
      <Text style={s.sub}>Friends are your first layer. Mutuals are people one connection away.</Text>

      {friendRequests.length > 0 && <>
        <View style={s.sectionRow}><Text style={s.section}>Requests</Text><Text style={s.badge}>{friendRequests.length}</Text></View>
        {friendRequests.map(request => {
          const user = users.find(u => u.id === request.userId);
          if (!user) return null;
          return <View key={request.id} style={s.person}>
            <View style={s.avatar}><Text style={s.avatarText}>{user.initials}</Text></View>
            <View style={{flex:1}}><Text style={s.name}>{user.name}</Text><Text style={s.meta}>@{user.username} · wants to be friends</Text></View>
            <View style={s.requestActions}>
              <Pressable onPress={() => respondFriendRequest(request.id, false)} style={s.passButton}><Ionicons name="close" size={17} color={colors.muted}/></Pressable>
              <Pressable onPress={() => respondFriendRequest(request.id, true)} style={s.acceptButton}><Ionicons name="checkmark" size={17} color="#fff"/></Pressable>
            </View>
          </View>;
        })}
      </>}

      <View style={s.sectionRow}><Text style={s.section}>Friends</Text><Text style={s.badge}>{friends.length}</Text></View>
      {friends.length === 0 ? <Text style={s.empty}>No friends yet. Add a mutual below.</Text> : friends.map(user => <Person key={user.id} name={user.name} username={user.username} initials={user.initials} detail="Friend" />)}

      <View style={s.sectionRow}><Text style={s.section}>Mutuals</Text><Text style={s.badge}>{mutuals.length}</Text></View>
      {mutuals.length === 0 ? <Text style={s.empty}>No mutuals available right now.</Text> : mutuals.map(user => <Person key={user.id} name={user.name} username={user.username} initials={user.initials} detail={`${mutualCount(user.id)} mutuals`} action="Add" onPress={() => addFriend(user.id)} />)}
    </ScrollView>
  </SafeAreaView>
}

function Person({name,username,initials,detail,action,onPress}:{name:string;username:string;initials:string;detail:string;action?:string;onPress?:()=>void}){
  return <View style={s.person}>
    <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
    <View style={{flex:1}}><Text style={s.name}>{name}</Text><Text style={s.meta}>@{username} · {detail}</Text></View>
    {action ? <Pressable onPress={onPress} style={s.addButton}><Ionicons name="person-add-outline" size={15} color="#EAF2FF"/><Text style={s.addButtonText}>{action}</Text></Pressable> : <View style={s.friendPill}><Ionicons name="checkmark" size={13} color={colors.success}/><Text style={s.friendText}>Friend</Text></View>}
  </View>
}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.bg},content:{paddingHorizontal:18,paddingTop:14,paddingBottom:60},header:{flexDirection:'row',alignItems:'center',gap:12,marginTop:4},back:{width:40,height:40,borderRadius:14,backgroundColor:colors.card,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.line},kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.8,color:colors.accent},heading:{fontSize:28,fontWeight:'900',color:colors.text,marginTop:2,letterSpacing:-.4},sub:{color:colors.muted,fontSize:14,lineHeight:21,marginTop:14,marginBottom:6},sectionRow:{flexDirection:'row',alignItems:'center',gap:8,marginTop:24,marginBottom:10},section:{fontSize:17,fontWeight:'900',color:colors.text},badge:{fontSize:11,fontWeight:'900',color:colors.accent,backgroundColor:colors.accentSoft,paddingHorizontal:8,paddingVertical:3,borderRadius:999},person:{backgroundColor:colors.card,borderRadius:18,borderWidth:1,borderColor:colors.line,padding:13,flexDirection:'row',alignItems:'center',gap:11,marginBottom:9},avatar:{width:44,height:44,borderRadius:15,backgroundColor:colors.accentSoft,borderWidth:1,borderColor:'#244B89',alignItems:'center',justifyContent:'center'},avatarText:{color:colors.accent,fontWeight:'900'},name:{fontSize:15,fontWeight:'900',color:colors.text},meta:{fontSize:12,color:colors.muted,marginTop:3},addButton:{backgroundColor:colors.accentStrong,borderRadius:12,paddingHorizontal:12,paddingVertical:9,flexDirection:'row',alignItems:'center',gap:6},addButtonText:{color:'#EAF2FF',fontSize:12,fontWeight:'900'},friendPill:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'#0C2A24',paddingHorizontal:9,paddingVertical:6,borderRadius:999},friendText:{color:colors.success,fontSize:11,fontWeight:'900'},empty:{color:colors.muted},requestActions:{flexDirection:'row',gap:7},passButton:{width:34,height:34,borderRadius:11,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.line},acceptButton:{width:34,height:34,borderRadius:11,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center'}})
