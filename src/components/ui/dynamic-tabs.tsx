import * as React from "react"
import { cn } from "@/lib/utils"

export interface SubTab {
  id: string
  label: string
  content: React.ReactNode
}

export interface MainTab {
  id: string
  label: string
  icon?: React.ReactNode
  subtabs?: SubTab[]
  content?: React.ReactNode
}

interface DynamicTabsProps {
  mainTabs: MainTab[]
  defaultTab?: string
  className?: string
  onTabChange?: (mainTabId: string, subTabId?: string) => void
}

export const DynamicTabs: React.FC<DynamicTabsProps> = ({
  mainTabs,
  defaultTab,
  className,
  onTabChange
}) => {
  const [activeMainTab, setActiveMainTab] = React.useState(defaultTab || mainTabs[0]?.id)
  const [activeSubTab, setActiveSubTab] = React.useState<string>("")

  const activeMainTabData = mainTabs.find(tab => tab.id === activeMainTab)
  const hasSubTabs = activeMainTabData?.subtabs && activeMainTabData.subtabs.length > 0

  React.useEffect(() => {
    if (hasSubTabs && !activeSubTab) {
      const firstSubTab = activeMainTabData.subtabs![0].id
      setActiveSubTab(firstSubTab)
    } else if (!hasSubTabs) {
      setActiveSubTab("")
    }
  }, [activeMainTab, hasSubTabs, activeMainTabData])

  const handleMainTabClick = (tabId: string) => {
    setActiveMainTab(tabId)
    const tabData = mainTabs.find(tab => tab.id === tabId)
    if (tabData?.subtabs && tabData.subtabs.length > 0) {
      const firstSubTab = tabData.subtabs[0].id
      setActiveSubTab(firstSubTab)
      onTabChange?.(tabId, firstSubTab)
    } else {
      setActiveSubTab("")
      onTabChange?.(tabId)
    }
  }

  const handleSubTabClick = (subTabId: string) => {
    setActiveSubTab(subTabId)
    onTabChange?.(activeMainTab, subTabId)
  }

  const getActiveContent = () => {
    if (hasSubTabs && activeSubTab) {
      const subTab = activeMainTabData.subtabs!.find(sub => sub.id === activeSubTab)
      return subTab?.content
    }
    return activeMainTabData?.content
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Main Tabs */}
      <div className="flex flex-wrap gap-1 md:gap-2 p-1 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-xl mb-6 overflow-x-auto">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleMainTabClick(tab.id)}
            className={cn(
              "flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-300 relative overflow-hidden group whitespace-nowrap flex-shrink-0",
              "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400/20",
              activeMainTab === tab.id
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110",
              activeMainTab === tab.id ? "text-white" : "text-slate-400"
            )}>
              {tab.icon}
            </div>
            <span className="text-xs md:text-sm font-medium">{tab.label}</span>
            {activeMainTab === tab.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg animate-pulse"></div>
            )}
          </button>
        ))}
      </div>

      {/* Sub Tabs - Only show for active main tab with subtabs */}
      {activeMainTabData && activeMainTabData.subtabs && activeMainTabData.subtabs.length > 0 && (
        <div className="flex flex-wrap gap-1 md:gap-2 p-2 bg-slate-700/30 backdrop-blur-sm rounded-lg border border-slate-600/50 mb-6 overflow-x-auto">
          {activeMainTabData.subtabs.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => handleSubTabClick(subTab.id)}
              className={cn(
                "px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 relative group whitespace-nowrap flex-shrink-0",
                "hover:scale-105 focus:outline-none focus:ring-1 focus:ring-cyan-400/30",
                activeSubTab === subTab.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-slate-600/50"
              )}
            >
              {subTab.label}
              {activeSubTab === subTab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="mt-4">
        {getActiveContent()}
      </div>
    </div>
  )
}