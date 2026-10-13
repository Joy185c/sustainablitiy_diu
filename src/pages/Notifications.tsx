import { useState, useEffect } from 'react';
import {
  Phone, Send, History,
  Filter, Search, Trash2, PhoneCall, RefreshCw, Bell, Copy, Settings, X
} from 'lucide-react';
import {
  loadSmsHistory, saveSmsHistory, getUserPhone, saveUserPhone,
  autoGenerateSms, ISSUE_LABELS,
} from '../data/smsStore';
import type { SmsMessage, SmsIssueType } from '../data/smsStore';
import { Card, PageHeader, DemoBanner, Button, SectionTitle } from '../components/ui';

const SEASONS = ['Kharif', 'Rabi', 'Pre-Kharif'];
const AUTO_ISSUE_CONFIG: { type: SmsIssueType; triggerLabel: string; riskLevel: 'high' | 'moderate' | 'low' }[] = [
  { type: 'high_salinity',     triggerLabel: 'High Salinity Detected',    riskLevel: 'high' },
  { type: 'moderate_salinity', triggerLabel: 'Moderate Salinity',         riskLevel: 'moderate' },
  { type: 'low_risk',          triggerLabel: 'Low Risk Confirmed',        riskLevel: 'low' },
  { type: 'soil_test_reminder',triggerLabel: 'Soil Test Due',             riskLevel: 'moderate' },
  { type: 'crop_advisory',     triggerLabel: 'Crop Season Advisory',     riskLevel: 'moderate' },
  { type: 'weather_alert',     triggerLabel: 'Weather / Rainfall Alert', riskLevel: 'moderate' },
];

export default function NotificationsPage() {
  const [history, setHistory] = useState<SmsMessage[]>(() => loadSmsHistory());
  const [phone, setPhone] = useState(getUserPhone);
  const [phoneInput, setPhoneInput] = useState(getUserPhone);
  const [showPhoneSetup, setShowPhoneSetup] = useState(!getUserPhone());
  const [tab, setTab] = useState<'auto' | 'history' | 'voice'>('auto');
  const [search, setSearch] = useState('');
  const [filterIssue, setFilterIssue] = useState<SmsIssueType | 'all'>('all');
  const [copied, setCopied] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [autoSeason, setAutoSeason] = useState('Rabi');
  const [autoRecipient, setAutoRecipient] = useState('Farmer');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Sync to localStorage on every change
  useEffect(() => { saveSmsHistory(history); }, [history]);

  // ─── Auto-generate all issue types
  const handleAutoGenerateAll = () => {
    if (!phone) { setShowPhoneSetup(true); return; }
    const newMsgs: SmsMessage[] = AUTO_ISSUE_CONFIG.map(cfg =>
      autoGenerateSms({
        issueType: cfg.type,
        riskLevel: cfg.riskLevel,
        recipientName: autoRecipient || 'Farmer',
        fieldLocation: 'Satkhira District',
        phone,
        season: autoSeason,
      })
    );
    setHistory(prev => [...newMsgs, ...prev]);
  };

  // ─── Auto-generate single issue
  const handleGenerateOne = (type: SmsIssueType, riskLevel: 'high' | 'moderate' | 'low') => {
    if (!phone) { setShowPhoneSetup(true); return; }
    const msg = autoGenerateSms({
      issueType: type, riskLevel,
      recipientName: autoRecipient || 'Farmer',
      fieldLocation: 'Satkhira District',
      phone, season: autoSeason,
    });
    setHistory(prev => [msg, ...prev]);
  };

  // ─── Simulate send
  const handleSend = (id: string) => {
    setSending(id);
    setTimeout(() => {
      setHistory(prev => prev.map(m =>
        m.id === id ? { ...m, status: 'sent', sentAt: new Date().toISOString() } : m
      ));
      setSending(null);
    }, 1200);
  };

  // ─── Copy
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  // ─── Delete
  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(m => m.id !== id));
    setDeleteId(null);
  };

  // ─── Phone save
  const savePhone = () => {
    saveUserPhone(phoneInput);
    setPhone(phoneInput);
    setShowPhoneSetup(false);
  };

  // ─── Filter
  const filtered = history.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.recipientName.toLowerCase().includes(q) || m.fieldLocation.toLowerCase().includes(q) || m.issueType.includes(q);
    const matchIssue = filterIssue === 'all' || m.issueType === filterIssue;
    return matchSearch && matchIssue;
  });

  const sentCount = history.filter(m => m.status === 'sent').length;
  const pendingCount = history.filter(m => m.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="SMS & Voice Advisories"
        subtitle="Auto-generated issue-based alerts with full send history"
      />

      <DemoBanner text="⚠ Demo Mode — No real SMS messages are sent. No phone numbers are transmitted. All messages are stored locally in your browser." />

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <StatChip icon="📨" label="Total Messages" value={history.length} color="#374151" />
        <StatChip icon="✅" label="Sent" value={sentCount} color="#16a34a" />
        <StatChip icon="⏳" label="Pending Send" value={pendingCount} color="#d97706" />
        <StatChip icon="📱" label="Phone Saved" value={phone ? '✓' : '—'} color={phone ? '#0d9488' : '#9ca3af'} />
      </div>

      {/* Phone setup banner */}
      {showPhoneSetup && (
        <Card style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <Phone size={20} color="#1a5c38" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f3b24', marginBottom: 6 }}>Set Your Phone Number</div>
              <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 12, lineHeight: 1.6 }}>
                Enter the farmer's phone number so auto-generated SMS messages are pre-addressed. No real messages are sent in demo mode.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  placeholder="+880 17xxxxxxxx"
                  style={{ flex: 1, minWidth: 180, padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'inherit' }}
                />
                <Button variant="primary" onClick={savePhone}>Save Phone</Button>
                <button onClick={() => setShowPhoneSetup(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #e5e7eb' }}>
        {[
          { key: 'auto', label: 'Auto-Generate', icon: RefreshCw },
          { key: 'history', label: `Message History (${history.length})`, icon: History },
          { key: 'voice', label: 'Voice Scripts', icon: PhoneCall },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as typeof tab)}
            style={{
              padding: '10px 18px', fontSize: 13.5, fontWeight: tab === key ? 700 : 500,
              border: 'none', background: 'none', cursor: 'pointer',
              color: tab === key ? '#1a5c38' : '#6b7280',
              borderBottom: tab === key ? '2px solid #1a5c38' : '2px solid transparent',
              marginBottom: -2, display: 'flex', alignItems: 'center', gap: 7,
            }}>
            <Icon size={15} /> {label}
          </button>
        ))}
        {phone && (
          <button onClick={() => setShowPhoneSetup(true)} style={{ marginLeft: 'auto', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: 12.5 }}>
            <Settings size={13} /> {phone}
          </button>
        )}
      </div>

      {/* ─── TAB: Auto-Generate */}
      {tab === 'auto' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Config row */}
          <Card>
            <SectionTitle>Auto-Generation Settings</SectionTitle>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 5 }}>Recipient Name</div>
                <input value={autoRecipient} onChange={e => setAutoRecipient(e.target.value)}
                  placeholder="Farmer name"
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13.5, fontFamily: 'inherit', minWidth: 160 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 5 }}>Season</div>
                <select value={autoSeason} onChange={e => setAutoSeason(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13.5, fontFamily: 'inherit' }}>
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Button variant="primary" onClick={handleAutoGenerateAll} style={{ height: 40 }}>
                <Bell size={14} /> Auto-Generate All Issues
              </Button>
            </div>
          </Card>

          {/* Issue cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {AUTO_ISSUE_CONFIG.map(cfg => {
              const meta = ISSUE_LABELS[cfg.type];
              const count = history.filter(m => m.issueType === cfg.type).length;
              const lastSent = history.filter(m => m.issueType === cfg.type && m.status === 'sent')[0];
              return (
                <Card key={cfg.type} style={{ border: `1px solid ${meta.color}20` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 28, lineHeight: 1 }}>{meta.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{meta.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{meta.labelBn}</div>
                    </div>
                    <span style={{ fontSize: 11, background: `${meta.color}15`, color: meta.color, borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>
                      {count} generated
                    </span>
                  </div>
                  {lastSent && (
                    <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 10 }}>
                      ✅ Last sent: {new Date(lastSent.sentAt!).toLocaleString()}
                    </div>
                  )}
                  <button
                    onClick={() => handleGenerateOne(cfg.type, cfg.riskLevel)}
                    style={{
                      width: '100%', padding: '8px', borderRadius: 8, cursor: 'pointer',
                      border: `1px solid ${meta.color}40`, background: `${meta.color}08`,
                      color: meta.color, fontWeight: 600, fontSize: 13,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                    <RefreshCw size={13} /> Generate & Queue
                  </button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB: History */}
      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', flex: 1, minWidth: 200 }}>
              <Search size={14} color="#9ca3af" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages…"
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13.5, fontFamily: 'inherit', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={13} color="#9ca3af" />
              <select value={filterIssue} onChange={e => setFilterIssue(e.target.value as typeof filterIssue)}
                style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit' }}>
                <option value="all">All Issues</option>
                {Object.entries(ISSUE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9ca3af', fontSize: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              No messages yet. Use the Auto-Generate tab to create your first advisory messages.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(msg => {
                const meta = ISSUE_LABELS[msg.issueType];
                return (
                  <Card key={msg.id} style={{ border: `1px solid ${msg.status === 'sent' ? '#bbf7d0' : '#e5e7eb'}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{meta.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 13.5, color: '#111827' }}>{meta.label}</span>
                          <StatusBadge status={msg.status} />
                          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>
                            {new Date(msg.generatedAt).toLocaleString()}
                          </span>
                        </div>

                        <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.7, background: '#f9fafb', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                          {msg.messageText}
                        </div>

                        <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7, background: '#fafaf0', borderRadius: 8, padding: '8px 12px', borderLeft: '3px solid #1a5c38', marginBottom: 10 }}>
                          {msg.messageBn}
                        </div>

                        <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11.5, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={11} /> {msg.phone}
                          </span>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>· {msg.fieldLocation} · {msg.season}</span>
                          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                            <button onClick={() => handleCopy(msg.messageText, msg.id)}
                              style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 9px', cursor: 'pointer', fontSize: 11.5, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Copy size={11} /> {copied === msg.id ? '✓ Copied' : 'Copy EN'}
                            </button>
                            <button onClick={() => handleCopy(msg.messageBn, msg.id + '_bn')}
                              style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 9px', cursor: 'pointer', fontSize: 11.5, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Copy size={11} /> {copied === msg.id + '_bn' ? '✓ Copied' : 'Copy BN'}
                            </button>
                            {msg.status === 'pending' && (
                              <button onClick={() => handleSend(msg.id)} disabled={sending === msg.id}
                                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 11.5, color: '#1a5c38', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Send size={11} /> {sending === msg.id ? 'Sending…' : 'Mark Sent'}
                              </button>
                            )}
                            <button onClick={() => setDeleteId(msg.id)}
                              style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#dc2626' }}>
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Voice Scripts */}
      {tab === 'voice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <PhoneCall size={20} color="#1a5c38" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f3b24', marginBottom: 5 }}>Voice Advisory Scripts</div>
                <div style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.7 }}>
                  Pre-written Bangla voice scripts for IVR (Interactive Voice Response) systems or field extension worker use. These scripts are designed to be read aloud or recorded for broadcast to farmers without smartphones.
                </div>
              </div>
            </div>
          </Card>

          {VoiceScripts.map((vs, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0f3b24' }}>{vs.title}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {vs.duration && <span style={{ fontSize: 11.5, color: '#9ca3af', background: '#f9fafb', padding: '3px 9px', borderRadius: 20, border: '1px solid #e5e7eb' }}>~{vs.duration}</span>}
                  <button onClick={() => handleCopy(vs.script, `voice_${i}`)}
                    style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, color: '#1a5c38', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Copy size={12} /> {copied === `voice_${i}` ? '✓ Copied' : 'Copy Script'}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 2, background: '#fafaf0', borderRadius: 8, padding: '12px 16px', borderLeft: '3px solid #1a5c38' }}>
                {vs.script}
              </div>
              <div style={{ marginTop: 8, fontSize: 11.5, color: '#9ca3af' }}>Scenario: {vs.scenario}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setDeleteId(null)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 14, padding: '24px 28px', maxWidth: 360, width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Delete Message?</div>
            <div style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 20 }}>This message will be removed from history.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: '#fffbeb', color: '#92400e', label: '⏳ Pending' },
    sent:    { bg: '#f0fdf4', color: '#14532d', label: '✅ Sent' },
    failed:  { bg: '#fee2e2', color: '#991b1b', label: '❌ Failed' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, borderRadius: 20, padding: '2px 8px' }}>{s.label}</span>
  );
}

function StatChip({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{label}</div>
        <div style={{ fontWeight: 800, fontSize: 18, color }}>{value}</div>
      </div>
    </Card>
  );
}

const VoiceScripts = [
  {
    title: 'High Salinity Risk — Kharif Season',
    scenario: 'High risk zone, Kharif season',
    duration: '45 sec',
    script: `প্রিয় কৃষক ভাই ও বোন,
SalinO-Crop কৃষি পরামর্শ সেবা থেকে আপনাকে একটি গুরুত্বপূর্ণ বার্তা জানাতে চাই।

আপনার এলাকায় এই খরিফ মৌসুমে উচ্চ লবণাক্ততার ঝুঁকি শনাক্ত করা হয়েছে।

আমাদের পরামর্শ হলো —
এক: বাংলাদেশ ধান গবেষণা ইনস্টিটিউট সুপারিশকৃত বিআরআরআই ধান ৪৭ জাতটি ব্যবহার করুন।
দুই: রোপণের আগে অবশ্যই মাটির লবণাক্ততা পরীক্ষা করুন।
তিন: প্রথম ভারী বৃষ্টির পরে রোপণ করলে সেরা ফলন পাবেন।
চার: যেকোনো সমস্যায় আপনার স্থানীয় কৃষি সম্প্রসারণ কর্মকর্তার সাথে যোগাযোগ করুন।

মনে রাখবেন — এই তথ্যটি ডেমো উদ্দেশ্যে। ধন্যবাদ।`,
  },
  {
    title: 'Moderate Risk — Rabi Season Guidance',
    scenario: 'Moderate risk, Rabi season',
    duration: '40 sec',
    script: `প্রিয় কৃষক,
SalinO-Crop থেকে আপনার রবি মৌসুমের পরামর্শ।

এই মৌসুমে আপনার এলাকায় মাঝারি লবণাক্ততার ঝুঁকি রয়েছে।

আমাদের সুপারিশ —
প্রথমত: বারি সরিষা-১৪ বা বারি সূর্যমুখী-২ জাত বিবেচনা করুন।
দ্বিতীয়ত: মাটির EC পরীক্ষা করুন। যদি ৪ dS/m-এর নিচে থাকে, সরিষা ভালো হবে।
তৃতীয়ত: মাঠের নিষ্কাশন ব্যবস্থা নিশ্চিত করুন।

স্থানীয় DAE অফিসে যোগাযোগ করুন। ধন্যবাদ। এটি একটি ডেমো বার্তা।`,
  },
  {
    title: 'Soil Test Reminder',
    scenario: 'Pre-season soil test reminder',
    duration: '30 sec',
    script: `প্রিয় কৃষক,
রোপণ মৌসুম শুরু হওয়ার আগে আপনার মাঠের মাটির EC পরীক্ষা করার সময় হয়েছে।

মাটি পরীক্ষার জন্য নিকটস্থ DAE অফিস বা BRRI গবেষণাগারে যোগাযোগ করুন।
সঠিক মাটি পরীক্ষা করলে আপনি সঠিক ফসল বেছে নিতে পারবেন এবং ভালো ফলন পাবেন।

সকল কৃষকের সুস্বাস্থ্য ও সমৃদ্ধি কামনা করে SalinO-Crop। এটি একটি ডেমো বার্তা।`,
  },
];
