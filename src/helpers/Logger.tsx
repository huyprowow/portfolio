// Logger.jsx
import React, { useEffect, useState } from 'react'
import { subscribeLogs, clearInfoLogs, logToGroup } from './logToGroup'

interface LogEntry {
  args: any[]
  timestamp: number
  file?: string
  line?: number
}

export default function Logger() {
  const [logs, setLogs] = useState<Record<string, LogEntry[]>>({})
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const unsub = subscribeLogs(setLogs)

    // Test logging to ensure it's working
    logToGroup('LOGGER', 'Logger component mounted and ready')

    return unsub
  }, [])

  // Toggle group expansion
  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  // Toggle logger visibility
  // Toggle logger visibility
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev)
  }

  // Test logging function
  const testLogging = () => {
    logToGroup('TEST', 'Test log message', { test: 'data' }, [1, 2, 3])
    logToGroup('DEBUG', 'Debug info', new Date().toISOString())
    logToGroup('ERROR', 'Error message', new Error('Test error'))
  }

  // Safe JSON stringify that handles circular references
  const safeStringify = (obj: any, maxDepth: number = 100): string => {
    const seen = new WeakSet()

    const replacer = (key: string, value: any, depth: number = 0): any => {
      if (depth > maxDepth) {
        return '[Max Depth Reached]'
      }

      if (value === null) return 'null'
      if (value === undefined) return 'undefined'

      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]'
        }

        seen.add(value)

        // Handle special cases
        if (value.constructor && value.constructor.name) {
          if (
            value.constructor.name.includes('Vector') ||
            value.constructor.name.includes('Matrix') ||
            value.constructor.name.includes('Quaternion')
          ) {
            return `[${value.constructor.name}] ${JSON.stringify(value, null, 2)}`
          }

          if (
            value.constructor.name.includes('Object3D') ||
            value.constructor.name.includes('Mesh') ||
            value.constructor.name.includes('Geometry') ||
            value.constructor.name.includes('Material')
          ) {
            return `[${value.constructor.name}] ${value.name || 'unnamed'}`
          }

          if (
            value.constructor.name.includes('Physics') ||
            value.constructor.name.includes('Body') ||
            value.constructor.name.includes('Collider')
          ) {
            return `[${value.constructor.name}]`
          }
        }

        // Handle arrays
        if (Array.isArray(value)) {
          if (value.length > 10) {
            return `[Array(${value.length})] ${value
              .slice(0, 10)
              .map((item, i) => replacer(`item${i}`, item, depth + 1))
              .join(', ')}...`
          }
          return value.map((item, i) => replacer(`item${i}`, item, depth + 1))
        }

        // Handle regular objects
        const result: any = {}
        for (const [k, v] of Object.entries(value)) {
          if (k.startsWith('_') || k.startsWith('__')) continue // Skip private properties
          result[k] = replacer(k, v, depth + 1)
        }
        return result
      }

      return value
    }

    try {
      return JSON.stringify(replacer('', obj, 0), null, 2)
    } catch (error) {
      return `[Error serializing: ${error.message}]`
    }
  }

  // Helper function to format log messages with collapsible objects
  const formatMessage = (args: any[]) => {
    return args.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return (
          <span key={index}>
            <details open style={{ display: 'inline-block', marginLeft: '10px' }}>
              <summary
                style={{
                  cursor: 'pointer',
                  color: '#4CAF50',
                  fontWeight: 'bold',
                  userSelect: 'none',
                }}
              >
                {Array.isArray(item) ? 'Array' : 'Object'} ▼
              </summary>
              <div
                style={{
                  marginLeft: '20px',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '11px',
                  maxWidth: '350px',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                {renderObject(item)}
              </div>
            </details>
          </span>
        )
      }
      return <span key={index}>{String(item)} </span>
    })
  }

  // Helper function to render objects with collapsible properties
  const renderObject = (obj: any, depth = 0) => {
    if (depth > 3) return <span style={{ color: '#888' }}>[Max Depth Reached]</span>

    if (obj === null) return <span style={{ color: '#888' }}>null</span>
    if (typeof obj === 'undefined') return <span style={{ color: '#888' }}>undefined</span>
    if (typeof obj === 'string') return <span style={{ color: '#4CAF50' }}>"{obj}"</span>
    if (typeof obj === 'number') return <span style={{ color: '#2196F3' }}>{obj}</span>
    if (typeof obj === 'boolean') return <span style={{ color: '#FF9800' }}>{obj.toString()}</span>

    if (Array.isArray(obj)) {
      return (
        <div>
          <span style={{ color: '#9C27B0' }}>[</span>
          {obj.length === 0 ? (
            <span style={{ color: '#888' }}>empty</span>
          ) : (
            obj.slice(0, 10).map((item, index) => (
              <div key={index} style={{ marginLeft: '15px' }}>
                {index}: {renderObject(item, depth + 1)}
                {index < obj.length - 1 && index < 9 && <span style={{ color: '#9C27B0' }}>,</span>}
              </div>
            ))
          )}
          {obj.length > 10 && <div style={{ color: '#888', marginLeft: '15px' }}>... and {obj.length - 10} more</div>}
          <span style={{ color: '#9C27B0' }}>]</span>
        </div>
      )
    }

    if (typeof obj === 'object') {
      const keys = Object.keys(obj)
      if (keys.length === 0) return <span style={{ color: '#888' }}>{'{}'}</span>

      return (
        <div>
          <span style={{ color: '#9C27B0' }}>{'{'}</span>
          {keys.slice(0, 10).map((key, index) => (
            <div key={key} style={{ marginLeft: '15px' }}>
              <span style={{ color: '#E91E63' }}>"{key}"</span>
              <span style={{ color: '#9C27B0' }}>: </span>
              {typeof obj[key] === 'object' && obj[key] !== null ? (
                <details style={{ display: 'inline-block' }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      color: '#4CAF50',
                      fontSize: '10px',
                    }}
                  >
                    {Array.isArray(obj[key]) ? 'Array' : 'Object'} ▶
                  </summary>
                  <div style={{ marginLeft: '10px' }}>{renderObject(obj[key], depth + 1)}</div>
                </details>
              ) : (
                renderObject(obj[key], depth + 1)
              )}
              {index < keys.length - 1 && index < 9 && <span style={{ color: '#9C27B0' }}>,</span>}
            </div>
          ))}
          {keys.length > 10 && (
            <div style={{ color: '#888', marginLeft: '15px' }}>... and {keys.length - 10} more properties</div>
          )}
          <span style={{ color: '#9C27B0' }}>{'}'}</span>
        </div>
      )
    }

    return <span>{String(obj)}</span>
  }

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  if (!isVisible) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: '50%',
          width: 100,
          height: 40,
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRadius: '8px 8px 0 0',
          zIndex: 99999000000000000,
          // Ensure pointer events work
          pointerEvents: 'auto',
        }}
        onClick={toggleVisibility}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.9)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.8)'
        }}
      >
        📋 Show Logger
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: '50%',
        width: 450,
        maxHeight: '60vh',
        overflowY: 'auto',
        background: 'rgba(0,0,0,0.9)',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 12,
        border: '1px solid #555',
        zIndex: 99999000000000000,
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        scrollbarColor: '#666 #333',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          background: '#111',
          borderBottom: '1px solid #444',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <strong style={{ color: '#4CAF50' }}>📋 Debug Logger</strong>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '11px',
            }}
            onClick={testLogging}
          >
            🧪 Test
          </button>
          <button
            style={{
              background: '#444',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '11px',
            }}
            onClick={clearInfoLogs}
          >
            🗑️ Clear
          </button>
          <button
            style={{
              background: '#666',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '11px',
            }}
            onClick={toggleVisibility}
          >
            ✕ Hide
          </button>
        </div>
      </div>

      <div
        style={{
          maxHeight: 'calc(60vh - 50px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          pointerEvents: 'auto',
        }}
      >
        {Object.keys(logs).length === 0 ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: '#888',
              fontStyle: 'italic',
            }}
          >
            No logs yet. Click "Test" to generate sample logs or check if your app is logging properly.
          </div>
        ) : (
          Object.entries(logs).map(([group, logEntries]) => {
            const isExpanded = expandedGroups[group] !== false

            return (
              <div
                key={group}
                style={{
                  borderBottom: '1px solid #333',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    background: '#222',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pointerEvents: 'auto',
                  }}
                  onClick={() => toggleGroup(group)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#333'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#222'
                  }}
                >
                  <span>
                    📁 {group} ({logEntries.length})
                  </span>
                  <span style={{ fontSize: '14px' }}>{isExpanded ? '▼' : '▶'}</span>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      padding: '8px 12px',
                      whiteSpace: 'pre-wrap',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderTop: '1px solid #444',
                    }}
                  >
                    {logEntries.map((logEntry, i) => (
                      <div
                        key={i}
                        style={{
                          marginBottom: '8px',
                          padding: '8px',
                          borderLeft: '2px solid #4CAF50',
                          paddingLeft: '12px',
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          borderRadius: '4px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#888',
                            marginBottom: '4px',
                            fontStyle: 'italic',
                          }}
                        >
                          📍 {logEntry.file}:{logEntry.line} • {formatTimestamp(logEntry.timestamp)}
                        </div>

                        <div style={{ fontSize: '12px' }}>{formatMessage(logEntry.args)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div
        style={{
          position: 'sticky',
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          padding: '4px 12px',
          fontSize: '10px',
          color: '#888',
          textAlign: 'center',
          borderTop: '1px solid #444',
        }}
      >
        {Object.keys(logs).length > 0 ? 'Scroll to see more logs' : 'Click Test to generate sample logs'}
      </div>
    </div>
  )
}
