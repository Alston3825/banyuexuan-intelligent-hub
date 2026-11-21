import unittest
from datetime import datetime, timezone, timedelta
from worker import candidates, split_quote


class PairTests(unittest.TestCase):
    def setUp(self):
        self.t = datetime(2026, 9, 5, tzinfo=timezone.utc)
        self.config = {'responders':['Li_1'], 'staff':['Li_1','admin']}

    def msg(self, id, sender, kind, content, seconds=0, room='test'):
        return dict(id=id,sequence_number=id,external_message_id=str(id),sender_id=sender,
                    message_type=kind,content=content,conversation_id=room,
                    message_time=self.t+timedelta(seconds=seconds))

    def test_unique_pair_and_media_isolation(self):
        q = self.msg(1,'customer','text',{'content':'宝宝皮肤问题'})
        media = self.msg(2,'customer','image',{},10)
        other = self.msg(3,'other','image',{},11)
        reply = self.msg(4,'Li_1','text',{'content':'这是一条引用/回复消息：\n"客户\n宝宝皮肤问题"\n------\n@客户测试回复'},20)
        result = list(candidates([q,media,other,reply],[{'id':10,'message_id':2},{'id':11,'message_id':3}],self.config))[0]
        self.assertEqual(result['question_message_id'],1)
        self.assertEqual(result['attachment_ids'],[10])
        self.assertEqual(result['category'],'皮肤问题')
        duplicate = self.msg(5,'other','text',{'content':'宝宝皮肤问题'},1)
        self.assertIsNone(list(candidates([q,duplicate,reply],[],self.config))[0]['question_message_id'])
        recall = self.msg(6,'Li_1','revoke',{'pre_msgid':'4'},30)
        self.assertEqual(list(candidates([q,reply,recall],[],self.config)),[])

    def test_formats_and_no_reply(self):
        self.assertEqual(split_quote('「客户：\n问题」\n- - - - -\n@客户答案'),('客户','问题','@客户答案'))
        self.assertIsNone(split_quote('收到'))

    def test_other_room_not_matched(self):
        q = self.msg(1,'customer','text',{'content':'问题'},room='other')
        reply = self.msg(2,'Li_1','text',{'content':'「客户：\n问题」\n------\n答案'},5)
        self.assertIsNone(list(candidates([q,reply],[],self.config))[0]['question_message_id'])


if __name__ == '__main__':
    unittest.main()
