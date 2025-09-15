'use client'

import AnimatedStat from './AnimatedStat'

interface StatCardProps {
  value: number
  title: string
  caption: string
  prefix?: string
  suffix?: string
}

export default function StatCard({
  value,
  title,
  caption,
  prefix = '+',
  suffix = ''
}: StatCardProps) {
  const ariaLabel = `${prefix}${new Intl.NumberFormat('en-US').format(value)}${suffix} — ${title}`

  return (
    <div className="stat-card">
      <div className="stat-value">
        <AnimatedStat
          value={value}
          prefix={prefix}
          suffix={suffix}
          ariaLabel={ariaLabel}
          className="stat-number"
        />
      </div>
      <h3 className="stat-title">{title}</h3>
      <p className="stat-caption">{caption}</p>
      
      <style jsx>{`
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(0, 0, 0, 0.05);
          text-align: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .stat-value {
          margin-bottom: 0.75rem;
        }
        
        .stat-value :global(.stat-number) {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1;
          background: linear-gradient(135deg, #00A651, #004A99);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
        }
        
        .stat-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }
        
        .stat-caption {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.4;
        }
        
        @media (min-width: 768px) {
          .stat-value :global(.stat-number) {
            font-size: 3rem;
          }
          
          .stat-title {
            font-size: 1.25rem;
          }
          
          .stat-caption {
            font-size: 0.9375rem;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .stat-card {
            background: #1f2937;
            border-color: rgba(255, 255, 255, 0.1);
          }
          
          .stat-title {
            color: #f3f4f6;
          }
          
          .stat-caption {
            color: #9ca3af;
          }
        }
        
        /* Reduced motion: remove hover effects */
        @media (prefers-reduced-motion: reduce) {
          .stat-card {
            transition: none;
          }
          
          .stat-card:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}