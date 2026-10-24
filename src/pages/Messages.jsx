import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUp, ChevronRight, MessagesSquare } from 'lucide-react';
import useMessageStore from '../store/messageStore';
import { Avatar } from '../components/Avatar';
import { formatMessageTime } from '../utils/format';
import { groupMessages } from '../utils/messages';

const MAX_LENGTH = 1000;
const POLL_MS = 5000;

const person = (other) => ({ ...other, _id: other?.id });

const ThreadList = ({ threads, activeId, loading }) => {
  if (threads.length === 0) {
    return (
      <div className="card p-6 text-center">
        <MessagesSquare className="mx-auto h-8 w-8 text-rose-500" aria-hidden="true" />
        <h2 className="mt-3 text-lg">{loading ? 'Loading…' : 'No conversations yet'}</h2>
        {!loading && <p className="page-sub mt-1">Once a relationship is active, you can message each other here.</p>}
      </div>
    );
  }
  return (
    <nav aria-label="Conversations" className="card overflow-hidden p-1.5">
      <ul className="space-y-0.5">
        {threads.map((t) => {
          const active = activeId === t.relationshipId;
          return (
            <li key={t.relationshipId}>
              <Link
                to={`/messages/${t.relationshipId}`}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors ${active ? 'bg-rose-50 dark:bg-rose-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Avatar person={person(t.other)} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={`truncate ${t.unread ? 'font-extrabold' : 'font-bold'}`}>{t.other.firstName} {t.other.lastName}</span>
                    {t.last && <span className={`shrink-0 text-xs ${t.unread ? 'font-bold text-rose-600 dark:text-rose-300' : 'text-gray-500 dark:text-gray-400'}`}>{formatMessageTime(t.last.createdAt)}</span>}
                  </span>
                  <span className="block truncate text-xs font-bold text-gray-500 dark:text-gray-400">{t.title}</span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span className={`truncate text-sm ${t.unread ? 'font-bold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                      {t.last ? `${t.last.mine ? 'You: ' : ''}${t.last.text}` : 'No messages yet'}
                    </span>
                    {t.unread > 0 && (
                      <span className="shrink-0 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-extrabold text-white" aria-label={`${t.unread} unread`}>{t.unread}</span>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const Bubble = ({ item }) => {
  const { message: m, first, last } = item;
  // Fully rounded, except the corner facing the sender (and the one above it inside a run)
  const corners = m.mine
    ? `rounded-2xl rounded-br-md ${first ? '' : 'rounded-tr-md'}`
    : `rounded-2xl rounded-bl-md ${first ? '' : 'rounded-tl-md'}`;
  return (
    <li className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'} ${first ? 'mt-3' : 'mt-0.5'}`}>
      <div className={`max-w-[80%] px-3.5 py-2 text-[15px] leading-snug ${corners} ${m.mine ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'}`}>
        <p className="whitespace-pre-wrap break-words">{m.text}</p>
      </div>
      {last && <span className="mt-1 px-1 text-[11px] text-gray-500 dark:text-gray-400">{formatMessageTime(m.createdAt)}</span>}
    </li>
  );
};

const Composer = ({ firstName, sending, onSend, error }) => {
  const [text, setText] = useState('');
  const box = useRef(null);

  // Grow with the text, up to about five lines
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [text]);

  const submit = async () => {
    const value = text.trim();
    if (!value || sending) return;
    const ok = await onSend(value);
    if (ok) setText('');
  };

  const ready = text.trim().length > 0 && !sending;
  return (
    <div className="border-t border-gray-200 p-3 dark:border-gray-700">
      {error && <p role="alert" className="mb-2 px-1 text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>}
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="flex items-end gap-2 rounded-3xl border border-gray-300 bg-white py-1.5 pl-4 pr-1.5 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-200 dark:border-gray-600 dark:bg-gray-800 dark:focus-within:ring-rose-900"
      >
        <label htmlFor="message-input" className="sr-only">Message {firstName}</label>
        <textarea
          id="message-input"
          ref={box}
          rows={1}
          maxLength={MAX_LENGTH}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={`Message ${firstName}…`}
          className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-snug outline-none placeholder:text-gray-500"
        />
        <button
          type="submit"
          disabled={!ready}
          aria-label="Send message"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${ready ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
      {text.length > MAX_LENGTH - 100 && <p className="mt-1 px-2 text-right text-xs text-gray-500">{text.length}/{MAX_LENGTH}</p>}
    </div>
  );
};

const Thread = ({ id }) => {
  const { thread, isLoading, sending, error, openThread, loadThreads, loadOlder, markRead, sendMessage } = useMessageStore();
  const [sendError, setSendError] = useState(null);
  const scroller = useRef(null);
  const lastId = useRef(null);

  useEffect(() => {
    lastId.current = null;
    openThread(id).then((r) => { if (r.success) markRead(id); });
    const timer = setInterval(async () => {
      if (document.hidden) return;
      await openThread(id, { quiet: true });
      loadThreads();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [id, openThread, loadThreads, markRead]);

  const messages = thread?.relationship?.id === id ? thread.messages : [];
  const newest = messages[messages.length - 1];

  // Jump to the bottom when a newer message arrives (not when older ones load above)
  useLayoutEffect(() => {
    if (!newest || newest.id === lastId.current) return;
    lastId.current = newest.id;
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
    if (!newest.mine) markRead(id);
  }, [newest, id, markRead]);

  const send = async (value) => {
    setSendError(null);
    const result = await sendMessage(id, value);
    if (!result.success && !result.ignored) setSendError(result.error);
    return result.success;
  };

  if (error && !thread) {
    return <div role="alert" className="card p-6 text-center font-bold text-rose-700 dark:text-rose-300">{error} <Link to="/messages" className="underline">Back to messages</Link></div>;
  }
  if (!thread || thread.relationship.id !== id) {
    return <div className="card flex h-[calc(100dvh-7rem)] items-center justify-center text-gray-600 md:h-[calc(100vh-10rem)] dark:text-gray-400">{isLoading ? 'Loading conversation…' : ''}</div>;
  }
  const { relationship } = thread;
  const { other } = relationship;

  return (
    <section aria-label={`Conversation with ${other.firstName}`} className="card flex h-[calc(100dvh-7rem)] min-h-[420px] flex-col overflow-hidden md:h-[calc(100vh-10rem)]">
      <header className="flex items-center gap-3 border-b border-gray-200 px-3 py-3 dark:border-gray-700">
        <Link to="/messages" className="btn btn-ghost btn-icon md:hidden" aria-label="Back to conversations"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></Link>
        <Avatar person={person(other)} size="md" />
        <div className="min-w-0 flex-1 leading-tight">
          <h2 className="truncate text-base">{other.firstName} {other.lastName}</h2>
          <p className="truncate text-xs font-bold text-gray-500 dark:text-gray-400">{relationship.title}</p>
        </div>
        <Link to={`/relationships/${relationship.id}`} className="inline-flex min-h-[44px] items-center gap-0.5 rounded-lg px-2 text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          View<span className="sr-only"> relationship</span><ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <div ref={scroller} className="flex-1 overflow-y-auto px-4 pb-3 pt-2">
        {thread.hasMore && (
          <button type="button" className="btn btn-secondary btn-sm mx-auto mt-2 block" onClick={() => loadOlder(id)}>Show earlier messages</button>
        )}
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Avatar person={person(other)} size="xl" />
            <div>
              <p className="text-lg font-extrabold">Say hello to {other.firstName}</p>
              <p className="page-sub mt-0.5">Only the two of you can read this.</p>
            </div>
          </div>
        ) : (
          <ol aria-label="Messages">
            {groupMessages(messages).map((item) => (item.type === 'day'
              ? <li key={item.key} className="mt-4 text-center text-xs font-bold text-gray-500 first:mt-1 dark:text-gray-400" aria-label={item.label}><span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">{item.label}</span></li>
              : <Bubble key={item.key} item={item} />))}
          </ol>
        )}
      </div>

      {relationship.canSend ? (
        <Composer firstName={other.firstName} sending={sending} onSend={send} error={sendError} />
      ) : (
        <p className="border-t border-gray-200 bg-gray-50 p-4 text-center text-sm font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          This relationship has ended. You can read these messages but not reply.
        </p>
      )}
    </section>
  );
};

const Messages = () => {
  const { id } = useParams();
  const { threads, isLoading, loadThreads } = useMessageStore();

  useEffect(() => { loadThreads(); }, [loadThreads]);

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-0 pt-4 md:px-10 md:pb-6 md:pt-8">
      <h1 className={`page-title mb-4 px-2 md:px-0 ${id ? 'hidden md:block' : ''}`}>Messages</h1>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-[320px_minmax(0,1fr)]">
        <div className={id ? 'hidden md:block' : ''}><ThreadList threads={threads} activeId={id} loading={isLoading} /></div>
        <div className={id ? '' : 'hidden md:block'}>
          {id ? <Thread id={id} /> : (
            <div className="card flex h-[calc(100vh-10rem)] min-h-[420px] flex-col items-center justify-center gap-2 text-center text-gray-600 dark:text-gray-400">
              <MessagesSquare className="h-10 w-10 text-rose-500" aria-hidden="true" />
              <p className="font-bold">Pick a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
