import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/src/context/AppContext';
import { colors } from '@/src/theme/colors';

export default function GroupsScreen() {
  const { groups, friendIds, getUser, createGroup, addFriendToGroup, removeFriendFromGroup } = useApp();
  const [name, setName] = useState('');
  const submit = () => { if (!name.trim()) return; createGroup(name, []); setName(''); };

  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={s.header}><Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={22} color={colors.text}/></Pressable><View><Text style={s.kicker}>AUDIENCES</Text><Text style={s.heading}>Groups</Text></View></View>
    <Text style={s.sub}>Build smaller circles for the activities you actually do together.</Text>

    <Text style={s.section}>Built in</Text>
    <View style={s.standardCard}><View style={s.icon}><Ionicons name="people" size={19} color={colors.accent}/></View><View style={{flex:1}}><Text style={s.title}>Friends</Text><Text style={s.meta}>Everyone you're friends with on I'm Down</Text></View><Text style={s.count}>{friendIds.length}</Text></View>
    <View style={s.standardCard}><View style={s.icon}><Ionicons name="git-network-outline" size={19} color={colors.accent}/></View><View style={{flex:1}}><Text style={s.title}>All</Text><Text style={s.meta}>Friends + your first-degree mutuals</Text></View></View>

    <Text style={s.section}>Create a group</Text>
    <View style={s.createRow}><TextInput value={name} onChangeText={setName} placeholder="e.g. Golf Crew" placeholderTextColor={colors.subtle} style={s.input}/><Pressable onPress={submit} style={s.createButton}><Ionicons name="add" size={18} color="#EAF2FF"/><Text style={s.createButtonText}>Create</Text></Pressable></View>

    <View style={s.sectionRow}><Text style={s.sectionNoMargin}>Your groups</Text><Text style={s.badge}>{groups.length}</Text></View>
    {groups.length === 0 ? <Text style={s.empty}>No custom groups yet.</Text> : groups.map(group => {
      const memberSet = new Set(group.memberIds);
      return <View key={group.id} style={s.groupCard}>
        <View style={s.groupHeader}><View><Text style={s.groupTitle}>{group.name}</Text><Text style={s.meta}>{group.memberIds.length} member{group.memberIds.length === 1 ? '' : 's'}</Text></View><View style={s.groupIcon}><Ionicons name="people-outline" size={18} color={colors.accent}/></View></View>
        {friendIds.map(friendId => {
          const user = getUser(friendId); if (!user) return null; const inGroup = memberSet.has(friendId);
          return <View key={friendId} style={s.personRow}><View style={s.avatar}><Text style={s.avatarText}>{user.initials}</Text></View><View style={{flex:1}}><Text style={s.personName}>{user.name}</Text><Text style={s.meta}>@{user.username}</Text></View><Pressable onPress={() => inGroup ? removeFriendFromGroup(group.id, friendId) : addFriendToGroup(group.id, friendId)} style={[s.memberButton, inGroup && s.memberButtonActive]}><Text style={[s.memberButtonText, inGroup && s.memberButtonTextActive]}>{inGroup ? 'Added' : 'Add'}</Text></Pressable></View>
        })}
      </View>
    })}
  </ScrollView></SafeAreaView>
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.bg},content:{paddingHorizontal:18,paddingTop:14,paddingBottom:60},header:{flexDirection:'row',alignItems:'center',gap:12,marginTop:4},back:{width:40,height:40,borderRadius:14,backgroundColor:colors.card,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.line},kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.8,color:colors.accent},heading:{fontSize:28,fontWeight:'900',color:colors.text,marginTop:2},sub:{color:colors.muted,fontSize:14,lineHeight:21,marginTop:14},section:{fontSize:17,fontWeight:'900',color:colors.text,marginTop:26,marginBottom:10},sectionRow:{flexDirection:'row',alignItems:'center',gap:8,marginTop:26,marginBottom:10},sectionNoMargin:{fontSize:17,fontWeight:'900',color:colors.text},badge:{fontSize:11,fontWeight:'900',color:colors.accent,backgroundColor:colors.accentSoft,paddingHorizontal:8,paddingVertical:3,borderRadius:999},standardCard:{backgroundColor:colors.card,borderWidth:1,borderColor:colors.line,borderRadius:18,padding:14,flexDirection:'row',alignItems:'center',gap:12,marginBottom:9},icon:{width:42,height:42,borderRadius:14,backgroundColor:colors.accentSoft,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#244B89'},title:{fontSize:15,fontWeight:'900',color:colors.text},meta:{color:colors.muted,fontSize:12,marginTop:3},count:{fontWeight:'900',color:colors.text},createRow:{flexDirection:'row',gap:9},input:{flex:1,backgroundColor:colors.input,color:colors.text,borderWidth:1,borderColor:colors.line,borderRadius:15,paddingHorizontal:14,paddingVertical:13,fontSize:15},createButton:{backgroundColor:colors.accentStrong,borderRadius:15,paddingHorizontal:15,justifyContent:'center',alignItems:'center',flexDirection:'row',gap:5},createButtonText:{color:'#EAF2FF',fontWeight:'900'},empty:{color:colors.muted},groupCard:{backgroundColor:colors.card,borderWidth:1,borderColor:colors.line,borderRadius:20,padding:14,marginBottom:14},groupHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingBottom:10},groupTitle:{fontSize:17,fontWeight:'900',color:colors.text},groupIcon:{width:36,height:36,borderRadius:12,backgroundColor:colors.accentSoft,alignItems:'center',justifyContent:'center'},personRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10,borderTopWidth:1,borderTopColor:colors.line},avatar:{width:38,height:38,borderRadius:13,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.line},avatarText:{color:colors.text,fontWeight:'900',fontSize:12},personName:{fontWeight:'800',color:colors.text},memberButton:{borderWidth:1,borderColor:colors.accent,borderRadius:10,paddingHorizontal:13,paddingVertical:7},memberButtonActive:{backgroundColor:colors.accentSoft,borderColor:'#244B89'},memberButtonText:{color:colors.accent,fontWeight:'900',fontSize:12},memberButtonTextActive:{color:'#DCE9FF'}
});
