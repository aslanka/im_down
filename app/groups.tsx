import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/src/context/AppContext';
import { colors } from '@/src/theme/colors';

export default function GroupsScreen() {
  const { groups, friendIds, getUser, createGroup, addFriendToGroup, removeFriendFromGroup } = useApp();
  const [name, setName] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    createGroup(name, []);
    setName('');
  };

  return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={24} color={colors.text}/></Pressable>
        <Text style={s.heading}>Groups</Text>
      </View>
      <Text style={s.sub}>Create smaller circles for the activities you actually do together.</Text>

      <Text style={s.section}>Standard audiences</Text>
      <View style={s.standardCard}><View style={s.icon}><Ionicons name="people" size={20} color={colors.accent}/></View><View style={{flex:1}}><Text style={s.title}>Friends</Text><Text style={s.meta}>Everyone you're friends with on I'm Down</Text></View><Text style={s.count}>{friendIds.length}</Text></View>
      <View style={s.standardCard}><View style={s.icon}><Ionicons name="globe-outline" size={20} color={colors.accent}/></View><View style={{flex:1}}><Text style={s.title}>All</Text><Text style={s.meta}>Friends + your first-degree mutuals</Text></View></View>

      <Text style={s.section}>Create a group</Text>
      <View style={s.createRow}><TextInput value={name} onChangeText={setName} placeholder="e.g. Golf Crew" style={s.input}/><Pressable onPress={submit} style={s.createButton}><Text style={s.createButtonText}>Create</Text></Pressable></View>

      <Text style={s.section}>Your groups</Text>
      {groups.length === 0 ? <Text style={s.empty}>No custom groups yet.</Text> : groups.map(group => {
        const memberSet = new Set(group.memberIds);
        return <View key={group.id} style={s.groupCard}>
          <View style={s.groupHeader}><View><Text style={s.title}>{group.name}</Text><Text style={s.meta}>{group.memberIds.length} member{group.memberIds.length === 1 ? '' : 's'}</Text></View></View>
          {friendIds.map(friendId => {
            const user = getUser(friendId);
            if (!user) return null;
            const inGroup = memberSet.has(friendId);
            return <View key={friendId} style={s.personRow}>
              <View style={s.avatar}><Text style={s.avatarText}>{user.initials}</Text></View>
              <View style={{flex:1}}><Text style={s.personName}>{user.name}</Text><Text style={s.meta}>@{user.username}</Text></View>
              <Pressable onPress={() => inGroup ? removeFriendFromGroup(group.id, friendId) : addFriendToGroup(group.id, friendId)} style={[s.memberButton, inGroup && s.memberButtonActive]}>
                <Text style={[s.memberButtonText, inGroup && s.memberButtonTextActive]}>{inGroup ? 'Added' : 'Add'}</Text>
              </Pressable>
            </View>
          })}
        </View>
      })}
    </ScrollView>
  </SafeAreaView>
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.bg},content:{padding:20,paddingBottom:60},header:{flexDirection:'row',alignItems:'center',gap:8,marginTop:8},back:{width:38,height:38,borderRadius:19,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.line},heading:{fontSize:30,fontWeight:'900',color:colors.text},sub:{color:colors.muted,fontSize:15,lineHeight:22,marginTop:10},section:{fontSize:17,fontWeight:'900',color:colors.text,marginTop:26,marginBottom:10},standardCard:{backgroundColor:'#fff',borderWidth:1,borderColor:colors.line,borderRadius:16,padding:14,flexDirection:'row',alignItems:'center',gap:12,marginBottom:9},icon:{width:40,height:40,borderRadius:20,backgroundColor:colors.accentSoft,alignItems:'center',justifyContent:'center'},title:{fontSize:16,fontWeight:'900',color:colors.text},meta:{color:colors.muted,fontSize:12,marginTop:3},count:{fontWeight:'900',color:colors.text},createRow:{flexDirection:'row',gap:10},input:{flex:1,backgroundColor:'#fff',borderWidth:1,borderColor:colors.line,borderRadius:14,paddingHorizontal:14,paddingVertical:12,fontSize:15},createButton:{backgroundColor:colors.accent,borderRadius:14,paddingHorizontal:18,justifyContent:'center'},createButtonText:{color:'#fff',fontWeight:'900'},empty:{color:colors.muted},groupCard:{backgroundColor:'#fff',borderWidth:1,borderColor:colors.line,borderRadius:18,padding:14,marginBottom:14},groupHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingBottom:8},personRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:9,borderTopWidth:1,borderTopColor:colors.line},avatar:{width:36,height:36,borderRadius:18,backgroundColor:colors.text,alignItems:'center',justifyContent:'center'},avatarText:{color:'#fff',fontWeight:'900',fontSize:12},personName:{fontWeight:'800',color:colors.text},memberButton:{borderWidth:1,borderColor:colors.accent,borderRadius:999,paddingHorizontal:14,paddingVertical:7},memberButtonActive:{backgroundColor:colors.accent},memberButtonText:{color:colors.accent,fontWeight:'900',fontSize:12},memberButtonTextActive:{color:'#fff'}
});
