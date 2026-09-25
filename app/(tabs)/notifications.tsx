import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/src/context/AppContext';
import { colors } from '@/src/theme/colors';

export default function NotificationsScreen(){
  const{notifications}=useApp();
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Text style={s.kicker}>ACTIVITY</Text><Text style={s.heading}>Notifications</Text><Text style={s.sub}>Requests, invites, and updates from your crew.</Text>
    {notifications.length===0?<View style={s.empty}><Ionicons name="notifications-off-outline" size={28} color={colors.accent}/><Text style={s.emptyTitle}>All caught up</Text></View>:notifications.map(n=><View key={n.id} style={s.item}><View style={s.icon}><Ionicons name="notifications-outline" size={18} color={colors.accent}/></View><View style={{flex:1}}><Text style={s.text}>{n.text}</Text><Text style={s.time}>{n.createdLabel}</Text></View>{!n.read&&<View style={s.dot}/>}</View>)}
  </ScrollView></SafeAreaView>
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:colors.bg},content:{paddingHorizontal:18,paddingTop:16,paddingBottom:120},kicker:{fontSize:11,fontWeight:'900',letterSpacing:2,color:colors.accent},heading:{fontSize:32,fontWeight:'900',marginTop:6,color:colors.text,letterSpacing:-.6},sub:{color:colors.muted,fontSize:14,lineHeight:21,marginTop:7,marginBottom:22},item:{backgroundColor:colors.card,borderWidth:1,borderColor:colors.line,borderRadius:20,padding:15,marginBottom:10,flexDirection:'row',alignItems:'center',gap:12},icon:{width:40,height:40,borderRadius:14,backgroundColor:colors.accentSoft,alignItems:'center',justifyContent:'center'},dot:{width:8,height:8,borderRadius:4,backgroundColor:colors.accent},text:{fontWeight:'700',fontSize:14,color:colors.text,lineHeight:20},time:{marginTop:5,color:colors.muted,fontSize:12},empty:{backgroundColor:colors.card,borderWidth:1,borderColor:colors.line,borderRadius:22,padding:28,alignItems:'center'},emptyTitle:{color:colors.text,fontWeight:'900',marginTop:10}})
