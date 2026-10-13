import { useState, useEffect } from 'react';
import { Copy, CheckCheck, Play, Square, MessageSquare, Mic, Clock } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { ADVISORY_TEMPLATES } from '../data/mockData';
import type { RiskLevel } from '../data/mockData';
import {
  Card, PageHeader, DemoBanner, SectionTitle, Button,
  FormGroup, Select, DataStatusBadge
} from '../components/ui';

interface HistoryItem {
  id: string;
  type: 'sms' | 'voice';
  risk: RiskLevel;
  season: string;
  text: string;
  generated_at: string;
  char_count?: number;
}

export default function Notifications() {
  const { t } = useLang();
  const [risk, setRisk] = useState<RiskLevel>('moderate');
  const [season, setSeason] = useState('rabi');
  const [smsText, setSmsText] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [copiedSms, setCopiedSms] = useState(false);
  const [copiedVoice, setCopiedVoice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ttsSupported, setTtsSupported] = useState(false);

  useEffect(() => {
    setTtsSupported('speechSynthesis' in window);
  }, []);

  function getTemplate() {
    return ADVISORY_TEMPLATES.find(a => a.risk === risk && a.season === season)
      || ADVISORY_TEMPLATES.find(a => a.risk === risk)
      || ADVISORY_TEMPLATES[0];
  }

  function generateSMS() {
    const template = getTemplate();
    const text = template.sms_bn;
    setSmsText(text);
    const item: HistoryItem = {
      id: Date.now().toString(), type: 'sms', risk, season, text,
      generated_at: new Date().toLocaleTimeString(), char_count: text.length,
    };
    setHistory(h => [item, ...h].slice(0, 10));
  }

  function generateVoice() {
    const template = getTemplate();
    const text = template.voice_bn;
    setVoiceText(text);
    const item: HistoryItem = {
      id: Date.now().toString(), type: 'voice', risk, season, text,
      generated_at: new Date().toLocaleTimeString(),
    };
    setHistory(h => [item, ...h].slice(0, 10));
  }

  function copy(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function speak(text: string) {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'bn-BD';
    utter.rate = 0.85;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }

  function stopSpeech() {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  const SMS_LIMIT = 160;
  const smsOver = smsText.length > SMS_LIMIT;

  const riskColor = { low: '#16a34a', moderate: '#d97706', high: '#dc2626' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title={t.sms_title} subtitle={t.sms_subtitle} />
      <DemoBanner text={t.sms_demo_notice} />

      {/* Controls */}
      <Card>
        <SectionTitle>Generate Advisory Message</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, alignItems: 'end' }}>
          <FormGroup label={t.sms_risk}>
            <Select value={risk} onChange={e => setRisk(e.target.value as RiskLevel)}>
              <option value="low">Low Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="high">High Risk</option>
            </Select>
          </FormGroup>
          <FormGroup label="Season">
            <Select value={season} onChange={e => setSeason(e.target.value)}>
              <option value="kharif">Kharif</option>
              <option value="rabi">Rabi</option>
            </Select>
          </FormGroup>
          <Button variant="primary" onClick={generateSMS} style={{ height: 38 }}>
            <MessageSquare size={14} /> {t.sms_generate_sms}
          </Button>
          <Button variant="secondary" onClick={generateVoice} style={{ height: 38 }}>
            <Mic size={14} /> {t.sms_generate_voice}
          </Button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* SMS Preview */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <SectionTitle>SMS Advisory</SectionTitle>
            <DataStatusBadge status="demonstration" />
          </div>

          {smsText ? (
            <>
              <div style={{
                background: '#f0fdf4', borderRadius: 10, padding: 14,
                fontFamily: "'Hind Siliguri', sans-serif", fontSize: 13.5,
                lineHeight: 1.7, color: '#111827', border: '1px solid #bbf7d0',
                whiteSpace: 'pre-wrap', minHeight: 80,
              }}>
                {smsText}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: smsOver ? '#dc2626' : '#6b7280',
                }}>
                  {smsText.length} / {SMS_LIMIT} {t.sms_char_count}
                  {smsOver && ' — Multi-part SMS'}
                </span>
                <Button variant="secondary" size="sm" onClick={() => copy(smsText, setCopiedSms)}>
                  {copiedSms ? <><CheckCheck size={13} /> {t.advisory_copied}</> : <><Copy size={13} /> {t.sms_copy}</>}
                </Button>
              </div>
            </>
          ) : (
            <div style={{
              height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9ca3af', fontSize: 13, background: '#fafafa', borderRadius: 8,
              border: '1px dashed #e5e7eb',
            }}>
              <MessageSquare size={20} style={{ marginRight: 8, opacity: 0.4 }} />
              Generate an SMS advisory to preview here
            </div>
          )}
        </Card>

        {/* Voice Preview */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <SectionTitle>Voice Script</SectionTitle>
            <DataStatusBadge status="demonstration" />
          </div>

          {voiceText ? (
            <>
              <div style={{
                background: '#f0f9ff', borderRadius: 10, padding: 14,
                fontFamily: "'Hind Siliguri', sans-serif", fontSize: 13.5,
                lineHeight: 1.8, color: '#111827', border: '1px solid #bae6fd',
                whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto',
              }}>
                {voiceText}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {ttsSupported && (
                  <Button
                    variant={isSpeaking ? 'danger' : 'secondary'}
                    size="sm"
                    onClick={isSpeaking ? stopSpeech : () => speak(voiceText)}
                  >
                    {isSpeaking ? <><Square size={13} /> {t.sms_stop}</> : <><Play size={13} /> {t.sms_play}</>}
                  </Button>
                )}
                {!ttsSupported && (
                  <span style={{ fontSize: 11.5, color: '#9ca3af' }}>TTS not supported in this browser</span>
                )}
                <Button variant="secondary" size="sm" onClick={() => copy(voiceText, setCopiedVoice)}>
                  {copiedVoice ? <><CheckCheck size={13} /> {t.advisory_copied}</> : <><Copy size={13} /> {t.sms_copy}</>}
                </Button>
              </div>

              {ttsSupported && (
                <div style={{ marginTop: 8, fontSize: 11.5, color: '#9ca3af' }}>
                  {t.sms_tts} — Uses browser Web Speech API. Quality depends on installed Bangla voice.
                </div>
              )}
            </>
          ) : (
            <div style={{
              height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9ca3af', fontSize: 13, background: '#fafafa', borderRadius: 8,
              border: '1px dashed #e5e7eb',
            }}>
              <Mic size={20} style={{ marginRight: 8, opacity: 0.4 }} />
              Generate a voice script to preview here
            </div>
          )}
        </Card>
      </div>

      {/* Session History */}
      {history.length > 0 && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Clock size={15} color="#374151" />
            <SectionTitle>{t.sms_history}</SectionTitle>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map(item => (
              <div key={item.id} style={{
                display: 'flex', gap: 12, padding: '10px 14px',
                borderRadius: 8, border: '1px solid #f3f4f6', background: '#fafafa',
                alignItems: 'flex-start',
              }}>
                <div style={{ flexShrink: 0 }}>
                  {item.type === 'sms'
                    ? <MessageSquare size={14} color="#0d9488" />
                    : <Mic size={14} color="#3b82f6" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>
                      {item.type}
                    </span>
                    <span style={{
                      fontSize: 11, background: `${riskColor[item.risk]}15`, color: riskColor[item.risk],
                      border: `1px solid ${riskColor[item.risk]}30`, borderRadius: 4, padding: '0 5px',
                    }}>
                      {item.risk}
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.season}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.generated_at}</span>
                    {item.char_count && (
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.char_count} chars</span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 12, color: '#4b5563', lineHeight: 1.5,
                    fontFamily: "'Hind Siliguri', sans-serif",
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.text}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copy(item.text, () => {})}>
                  <Copy size={12} />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info box */}
      <Card style={{ background: '#f8fafc' }}>
        <SectionTitle>About Inclusive Advisory Delivery</SectionTitle>
        <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.8 }}>
          <p>SalinO-Crop demonstrates how agricultural guidance could reach farmers who do not use web interfaces.
          The SMS format is designed to fit within 160-character limits for standard mobile networks.</p>
          <p>The voice script format is designed for integration with IVR (Interactive Voice Response) systems
          or community radio broadcasts in Bangla, supporting farmers with limited literacy.</p>
          <p style={{ color: '#9ca3af', fontSize: 12 }}>
            This is a demonstration. No real messages are sent. No phone numbers are collected.
            Integration with actual SMS gateways (e.g., Teletalk, Robi APIs) or IVR systems would require
            appropriate licensing, data protection, and farmer consent procedures.
          </p>
        </div>
      </Card>
    </div>
  );
}
