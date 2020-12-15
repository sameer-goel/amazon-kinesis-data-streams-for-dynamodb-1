set -e

TABLE_NAME=$1
KEY_NAME=$2

# Get id list
aws dynamodb scan --table-name $TABLE_NAME | jq ".Items[].$KEY_NAME.S" > "/tmp/dynamo_${TABLE_NAME}_keys.txt"

ALL_KEYS=$(cat "/tmp/dynamo_${TABLE_NAME}_keys.txt")

# Delete from id list
for key in $ALL_KEYS;do
  aws dynamodb delete-item --table-name $TABLE_NAME --key "{ \"$KEY_NAME\": { \"S\": $key }}"
done

# Remove id list
rm "/tmp/dynamo_${TABLE_NAME}_keys.txt"