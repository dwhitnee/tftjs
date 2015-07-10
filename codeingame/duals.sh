# horses;
read N
for (( i=0; i<N; i++ )); do
    read Pi
    horses[i]=$Pi
done

horses=($(echo "${horses[@]}" | sed 's/ /\n/g' | sort -n))
echo ${horses[*]} >&2

bestDiff=1000

for (( i=1; i<=$(( ${#horses[@]} )); i++ ))
do
    a=${horses[$((i-1))]}
    b=${horses[$i]}
    diff=$((a-b))
    if [ "$diff" -lt 0 ]; then
        diff=$((0-diff))
    fi

    if [ "$diff" -lt $bestDiff ]; then
        bestDiff=$diff
    fi

done

echo $bestDiff
