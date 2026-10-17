# run from pitch-video. Delays in ms = block start (block 9 slightly early so it ends before the cut)
D=178
ST=(0 11000 31000 53000 74000 102000 118000 140000 158600)
IN=""; FC=""; MIX=""
for i in $(seq 0 8); do n=$(printf %02d $((i+1))); IN="$IN -i assets/vo-part2-v2/$n.wav"; FC="$FC[$i:a]aresample=48000,aformat=channel_layouts=mono,adelay=${ST[$i]}:all=1[a$i];"; MIX="$MIX[a$i]"; done
ffmpeg -y -hide_banner -loglevel error $IN -filter_complex "${FC}${MIX}amix=inputs=9:normalize=0:dropout_transition=0,apad=whole_dur=$D,atrim=0:$D,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad=whole_dur=$D,atrim=0:$D[out]" -map "[out]" -ar 48000 -ac 1 assets/vo-part2-v2/part2-v2-vo.wav
ffmpeg -y -hide_banner -loglevel error -i renders/part2-scenario-v2.mp4 -i assets/vo-part2-v2/part2-v2-vo.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -t $D renders/part2-voiced-v2.mp4
