import React from 'react';
import { StatusCard } from '@/components/ui/status-card';

export default function StatusCardDemo() {
  return (
    <div className="admin-theme">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Status Cards</h1>
          <p>Professional light theme status cards for the admin dashboard</p>
        </div>
        
        <div className="admin-grid admin-grid-4 mb-8">
          <StatusCard 
            type="success" 
            title="Accepted" 
            value={3} 
            description="Applications" 
            percentage="+5%" 
          />
          
          <StatusCard 
            type="error" 
            title="Rejected" 
            value={0} 
            description="Denied" 
            percentage="+2.5%" 
          />
          
          <StatusCard 
            type="pending" 
            title="Processing" 
            value={12} 
            description="In queue" 
            percentage="+12%" 
          />
          
          <StatusCard 
            type="warning" 
            title="Attention" 
            value={2} 
            description="Requires review" 
            percentage="-1.5%" 
          />
        </div>
        
        <div className="admin-card p-8">
          <h2 className="text-3xl font-black mb-6">Usage Instructions</h2>
          
          <div className="prose max-w-none">
            <p>
              The StatusCard component is a versatile card for displaying status metrics in your admin dashboard. 
              It follows our professional light theme design system and provides multiple visual variations.
            </p>
            
            <h3>Import</h3>
            <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto">
              <code>import {'{'} StatusCard {'}'} from "@/components/ui/status-card";</code>
            </pre>
            
            <h3>Basic Usage</h3>
            <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto">
              <code>{`<StatusCard 
  type="success" 
  title="Accepted" 
  value={3} 
  description="Applications" 
  percentage="+5%" 
/>`}</code>
            </pre>
            
            <h3>Visual Variants</h3>
            <p>The StatusCard comes in four visual variants:</p>
            <ul>
              <li><strong>Success</strong> (green): For positive metrics and completed statuses</li>
              <li><strong>Warning</strong> (amber): For metrics that need attention</li>
              <li><strong>Error</strong> (red): For negative metrics or issues</li>
              <li><strong>Pending</strong> (blue): For in-progress or neutral metrics</li>
            </ul>
            
            <h3>Customization</h3>
            <p>The StatusCard component accepts these props:</p>
            <ul>
              <li><code>type</code>: 'success' | 'warning' | 'error' | 'pending'</li>
              <li><code>title</code>: The card title/label</li>
              <li><code>value</code>: The metric value (number or string)</li>
              <li><code>description</code>: Optional description text</li>
              <li><code>percentage</code>: Optional percentage change indicator</li>
              <li><code>className</code>: Additional CSS classes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
