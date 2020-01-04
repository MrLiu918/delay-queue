# delay-queue
基于时间轮的延时消息,仅供参考
```
{
    delay:20,//延时时间(s)
    targetTopic:'defaultOut',//延时后进入的topic
    data:{task:'..'},//业务信息
}
```

生产者产生延时消息->延时->目标topic->消费者

![rts_v3_architecture](res/DelayQueue.png)