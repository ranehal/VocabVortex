import re

with open('mobile/app/(tabs)/movies.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State
state_old = """  const [jumpH, setJumpH] = useState(0);
  const [jumpM, setJumpM] = useState(0);
  const [jumpS, setJumpS] = useState(0);
  const [translatingLine, setTranslatingLine] = useState(null);"""

state_new = """  const [scrubberWidth, setScrubberWidth] = useState(0);
  const [translatingLine, setTranslatingLine] = useState(null);"""
content = content.replace(state_old, state_new)

# 2. handleJump
handle_old = """  const handleJump = () => {
    const targetSec = (jumpH * 3600) + (jumpM * 60) + jumpS;
    const index = filteredDialogues.findIndex(d => timeToSeconds(d.timestamp) >= targetSec);
    if (index !== -1) {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0 });
      }
      setHighlightedIndex(index);
      setTimeout(() => setHighlightedIndex(null), 3000);
      const target = filteredDialogues[index];
      const realIndex = dialogues.indexOf(target);
      if (realIndex !== -1 && !target.bn) translateLine(realIndex, target.en);
    } else { alert("Time beyond subtitles."); }
  };"""

handle_new = """  const totalDuration = useMemo(() => {
      if (dialogues.length === 0) return 0;
      const last = dialogues[dialogues.length - 1];
      return last.endTime || timeToSeconds(last.timestamp) + 5;
  }, [dialogues]);

  const jumpToTime = (targetSec) => {
    setPlaybackPosition(targetSec);
    const index = filteredDialogues.findIndex(d => (d.startTime || timeToSeconds(d.timestamp)) >= targetSec);
    if (index !== -1) {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
      setHighlightedIndex(index);
      setTimeout(() => setHighlightedIndex(null), 3000);
      
      if (localVideoUri && videoRef.current) {
          videoRef.current.setPositionAsync(targetSec * 1000);
      } else {
          const target = filteredDialogues[index];
          const realIndex = dialogues.indexOf(target);
          if (realIndex !== -1 && !target.bn) translateLine(realIndex, target.en);
      }
    } else {
        if (localVideoUri && videoRef.current) videoRef.current.setPositionAsync(targetSec * 1000);
    }
  };

  const handleScrub = (evt) => {
      if (scrubberWidth === 0 || totalDuration === 0) return;
      const locX = evt.nativeEvent.locationX;
      const percentage = Math.max(0, Math.min(1, locX / scrubberWidth));
      const targetSec = percentage * totalDuration;
      jumpToTime(targetSec);
  };

  const formatTime = (secs) => {
      if (isNaN(secs) || secs < 0) return "00:00:00";
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = Math.floor(secs % 60);
      return f"{h > 0 ? h.toString().padStart(2, '0') + ':' : ''}{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}";
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
     if (viewableItems.length > 0 && !localVideoUri) {
         const topItem = viewableItems[0].item;
         if (topItem) setPlaybackPosition(topItem.startTime || timeToSeconds(topItem.timestamp));
     }
  }).current;"""
  
# fix template literal backticks inside python string
handle_new = handle_new.replace('f"{', '`${').replace('}"', '}`')

content = content.replace(handle_old, handle_new)

# 3. UI Replacement
ui_old = """                    <View style={[styles.jumpBox, { backgroundColor: activeTheme.bg, borderColor: activeTheme.border }]}>
                    <Clock size={16} color={activeTheme.accent} />
                    <View style={styles.wheelContainer}>
                        <WheelPicker range={24} value={jumpH} onChange={setJumpH} activeTheme={activeTheme} />
                        <Text style={{ color: activeTheme.text, fontWeight: 'bold', fontSize: 24 }}>:</Text>
                        <WheelPicker range={60} value={jumpM} onChange={setJumpM} activeTheme={activeTheme} />
                        <Text style={{ color: activeTheme.text, fontWeight: 'bold', fontSize: 24 }}>:</Text>
                        <WheelPicker range={60} value={jumpS} onChange={setJumpS} activeTheme={activeTheme} />
                    </View>
                    <TouchableOpacity onPress={handleJump} style={[styles.jumpBtn, { backgroundColor: activeTheme.accent }]} nativeID="jump-btn"><Text style={styles.jumpBtnText}>JUMP</Text></TouchableOpacity>
                    </View>"""

ui_new = """                    <View style={[styles.jumpBox, { backgroundColor: activeTheme.bg, borderColor: activeTheme.border, flexDirection: 'column', alignItems: 'stretch' }]}>
                       <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                           <Text style={{ color: activeTheme.text, fontWeight: 'bold' }}>{formatTime(playbackPosition)}</Text>
                           <Text style={{ color: activeTheme.subText, fontWeight: '600' }}>{formatTime(totalDuration)}</Text>
                       </View>
                       <TouchableOpacity 
                           activeOpacity={1} 
                           onPress={handleScrub}
                           onLayout={(e) => setScrubberWidth(e.nativeEvent.layout.width)}
                           style={{ height: 40, justifyContent: 'center' }}
                           nativeID="jump-btn"
                       >
                           <View style={{ height: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
                               <MotiView 
                                 animate={{ width: `${totalDuration > 0 ? (playbackPosition / totalDuration) * 100 : 0}%` }}
                                 transition={{ type: 'timing', duration: 150 }}
                                 style={{ height: '100%', backgroundColor: activeTheme.accent }}
                               />
                           </View>
                           <MotiView 
                               animate={{ left: `${totalDuration > 0 ? (playbackPosition / totalDuration) * 100 : 0}%` }}
                               transition={{ type: 'timing', duration: 150 }}
                               style={{ position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: activeTheme.text, marginLeft: -10, elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.5, shadowRadius: 4 }}
                           />
                       </TouchableOpacity>
                    </View>"""
content = content.replace(ui_old, ui_new)

# 4. FlatList Replacement
flat_old = """          <FlatList
            ref={flatListRef}
            data={filteredDialogues}
            keyExtractor={(item, index) => index.toString()}"""
            
flat_new = """          <FlatList
            ref={flatListRef}
            data={filteredDialogues}
            keyExtractor={(item, index) => index.toString()}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}"""
            
content = content.replace(flat_old, flat_new)

with open('mobile/app/(tabs)/movies.js', 'w', encoding='utf-8') as f:
    f.write(content)
