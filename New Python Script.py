import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, Rectangle
import numpy as np

# Set up the figure with a modern aspect ratio (mobile-first design)
fig, ax = plt.subplots(1, 1, figsize=(10, 16))
ax.set_xlim(0, 100)
ax.set_ylim(0, 160)
ax.axis('off')

# Color palette
colors = {
    'primary': '#4F46E5',      # Deep Indigo
    'secondary': '#F97316',     # Warm Coral
    'success': '#10B981',      # Emerald
    'bg': '#FDFCF8',           # Soft Cream
    'surface': '#FFFFFF',      # White
    'text': '#1E293B',         # Slate
    'text_light': '#64748B',   # Light Slate
    'accent_bg': '#EEF2FF',    # Light Indigo
    'coral_bg': '#FFF7ED',     # Light Coral
    'emerald_bg': '#ECFDF5'    # Light Emerald
}

# Background
ax.add_patch(Rectangle((0, 0), 100, 160, facecolor=colors['bg'], edgecolor='none'))

# Status Bar (simulated)
ax.add_patch(Rectangle((0, 155), 100, 5, facecolor=colors['surface'], edgecolor='none'))
ax.text(50, 157.5, '9:41 AM', ha='center', va='center', fontsize=8, color=colors['text'], weight='bold')

# Header Section
header_y = 148
ax.add_patch(FancyBboxPatch((5, header_y-8), 90, 12, boxstyle="round,pad=0.3", 
                            facecolor=colors['surface'], edgecolor='none'))
ax.text(8, header_y-2, '👋 Good morning, Sarah!', fontsize=11, color=colors['text'], weight='bold')
ax.text(8, header_y-6, 'Psychology Major • Week 8', fontsize=8, color=colors['text_light'])

# Streak Badge (top right)
ax.add_patch(Circle((88, header_y-3), 4, facecolor=colors['coral_bg'], edgecolor=colors['secondary'], linewidth=2))
ax.text(88, header_y-3, '🔥', ha='center', va='center', fontsize=8)
ax.text(88, header_y-8, '12', ha='center', va='center', fontsize=7, color=colors['secondary'], weight='bold')

# Priority Alert Card
alert_y = 130
ax.add_patch(FancyBboxPatch((5, alert_y-12), 90, 14, boxstyle="round,pad=0.4", 
                            facecolor=colors['coral_bg'], edgecolor=colors['secondary'], linewidth=1.5))
ax.text(8, alert_y-3, '⚠️ Priority Week Alert', fontsize=10, color=colors['secondary'], weight='bold')
ax.text(8, alert_y-8, '3 assignments due • Stats exam in 5 days', fontsize=8, color=colors['text'])
ax.text(85, alert_y-6, '›', fontsize=14, color=colors['secondary'], weight='bold')

# Quick Actions Row
actions_y = 110
actions = [
    ('📅', 'Timetable', colors['accent_bg'], colors['primary']),
    ('✅', 'Tasks', colors['emerald_bg'], colors['success']),
    ('👥', 'Buddies', colors['coral_bg'], colors['secondary']),
    ('⏱️', 'Focus', colors['accent_bg'], colors['primary'])
]

for i, (icon, label, bg_color, icon_color) in enumerate(actions):
    x = 8 + i * 23
    # Icon circle
    ax.add_patch(Circle((x+6, actions_y), 8, facecolor=bg_color, edgecolor='none'))
    ax.text(x+6, actions_y, icon, ha='center', va='center', fontsize=12)
    # Label
    ax.text(x+6, actions_y-10, label, ha='center', va='center', fontsize=7, color=colors['text'])

# Today's Schedule Section
schedule_y = 88
ax.text(8, schedule_y, "Today's Schedule", fontsize=11, color=colors['text'], weight='bold')
ax.text(85, schedule_y, "See All ›", fontsize=8, color=colors['primary'])

# Schedule Cards
schedule_items = [
    ('9:00 AM', 'Research Methods', 'Lecture • Room 302', colors['primary'], '2 hrs'),
    ('11:30 AM', 'Study Session', 'with Alex • Library', colors['success'], '1.5 hrs'),
    ('2:00 PM', 'Stats Assignment', 'Due tomorrow!', colors['secondary'], 'High Priority')
]

card_y = 78
for i, (time, title, subtitle, color, badge) in enumerate(schedule_items):
    y = card_y - i * 18
    # Card background
    ax.add_patch(FancyBboxPatch((5, y-12), 90, 14, boxstyle="round,pad=0.3", 
                                facecolor=colors['surface'], edgecolor='#E2E8F0', linewidth=1))
    # Time indicator line
    ax.add_patch(Rectangle((5, y-12), 3, 14, facecolor=color, edgecolor='none'))
    # Content
    ax.text(12, y-3, time, fontsize=7, color=colors['text_light'])
    ax.text(12, y-7, title, fontsize=9, color=colors['text'], weight='bold')
    ax.text(12, y-10, subtitle, fontsize=7, color=colors['text_light'])
    # Badge
    badge_color = color if 'Priority' in badge else colors['text_light']
    ax.text(88, y-6, badge, ha='right', fontsize=7, color=badge_color, weight='bold')

# Assignments Progress Section
assign_y = 22
ax.text(8, assign_y, "Assignment Progress", fontsize=11, color=colors['text'], weight='bold')
ax.text(85, assign_y, "+ Add ›", fontsize=8, color=colors['primary'])

# Progress Rings
progress_items = [
    ('Stats HW', 0.75, colors['secondary']),
    ('Psych Essay', 0.30, colors['primary']),
    ('Bio Lab', 0.90, colors['success'])
]

prog_y = 12
for i, (label, progress, color) in enumerate(progress_items):
    x = 12 + i * 30
    # Draw progress ring (simplified as circle with text)
    ax.add_patch(Circle((x, prog_y), 8, facecolor='none', edgecolor=color, linewidth=3))
    ax.add_patch(Circle((x, prog_y), 8, facecolor='none', edgecolor='#E2E8F0', linewidth=3, alpha=0.3))
    ax.text(x, prog_y, f'{int(progress*100)}%', ha='center', va='center', fontsize=8, color=color, weight='bold')
    ax.text(x, prog_y-10, label, ha='center', va='center', fontsize=7, color=colors['text'])

# Bottom Navigation
nav_y = 3
ax.add_patch(Rectangle((0, 0), 100, 8, facecolor=colors['surface'], edgecolor='#E2E8F0', linewidth=1))
nav_items = [('🏠', 'Home', True), ('📅', 'Schedule', False), ('👥', 'Buddies', False), ('📊', 'Stats', False)]
for i, (icon, label, active) in enumerate(nav_items):
    x = 12.5 + i * 25
    color = colors['primary'] if active else colors['text_light']
    ax.text(x, nav_y+3, icon, ha='center', va='center', fontsize=10)
    ax.text(x, nav_y-0.5, label, ha='center', va='center', fontsize=6, color=color, weight='bold' if active else 'normal')

# Floating Action Button (FAB)
ax.add_patch(Circle((85, 35), 6, facecolor=colors['secondary'], edgecolor='none', zorder=10))
ax.text(85, 35, '+', ha='center', va='center', fontsize=14, color='white', weight='bold', zorder=11)

plt.tight_layout()
plt.savefig('/mnt/kimi/output/studybuddy_dashboard_wireframe.png', dpi=150, bbox_inches='tight', 
            facecolor=colors['bg'], edgecolor='none')
plt.show()
print("Dashboard wireframe created!")