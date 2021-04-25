for TOPIC in user-topic auth-topic activity-topic transaction-topic group-topic response_topic; do
  bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic $TOPIC
done
