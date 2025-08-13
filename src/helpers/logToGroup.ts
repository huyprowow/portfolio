// logToGroup.js
interface LogEntry {
  args: any[]
  timestamp: number
  file?: string
  line?: number
}

const logGroups: Record<string, LogEntry[]> = {}
let subscribers: ((logs: Record<string, LogEntry[]>) => void)[] = []

// Get caller file information from the actual call site
const getCallerInfo = () => {
  try {
    const stack = new Error().stack
    if (stack) {
      const lines = stack.split('\n')

      // Skip: Error, getCallerInfo, logToGroup
      // The 4th line (index 3) should be the actual caller
      if (lines.length > 3) {
        const callerLine = lines[3]

        // Extract file and line from: at functionName (file:line:column)
        const match = callerLine.match(/at\s+.*?\s+\((.+):(\d+):(\d+)\)/)
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
          }
        }

        // Alternative format: at file:line:column
        const altMatch = callerLine.match(/at\s+(.+):(\d+):(\d+)/)
        if (altMatch) {
          return {
            file: altMatch[1],
            line: parseInt(altMatch[2]),
          }
        }
      }
    }
  } catch (error) {
    console.error('Error getting caller info:', error)
  }

  return { file: 'unknown', line: 0 }
}

// Push a log to a group (only for UI, not console)
export const logToGroup = (group: string, ...args: any[]) => {
  if (!logGroups[group]) logGroups[group] = []

  const callerInfo = getCallerInfo()
  const logEntry: LogEntry = {
    args,
    timestamp: Date.now(),
    file: callerInfo.file,
    line: callerInfo.line,
  }

  // Store in UI logger
  logGroups[group].push(logEntry)
  // Only log the location, not the object content
  const location = `📍 ${callerInfo.file}:${callerInfo.line}`
  console.log(group, ...args,location)
  // Notify subscribers
  subscribers.forEach(callback => callback(logGroups))
}

// Clear only "info logs" (our custom UI state)
export const clearInfoLogs = () => {
  for (const key in logGroups) {
    logGroups[key] = []
  }
  subscribers.forEach((fn) => fn({ ...logGroups }))
}

// Subscribe a React component to log updates
export const subscribeLogs = (fn: (logs: Record<string, LogEntry[]>) => void) => {
  subscribers.push(fn)
  return () => {
    subscribers = subscribers.filter((s) => s !== fn)
  }
}

// Get logs for a specific group
export const getLogsForGroup = (group: string) => {
  return logGroups[group] || []
}

// Get all logs
export const getAllLogs = () => {
  return { ...logGroups }
}
