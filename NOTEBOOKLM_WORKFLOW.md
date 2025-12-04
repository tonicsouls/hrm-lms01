# NotebookLM Integration Workflow

This guide explains how to use NotebookLM to generate video content from the existing video scripts.

## Overview

All 9 modules have professionally written video scripts with:
- Scene breakdowns with timing
- Visual cues and descriptions
- Narrator voice-over text
- On-screen text markers

Total: **18 videos** (2 per module), approximately **90-126 minutes** of content.

## Step-by-Step Workflow

### Phase 1: Preparation

1. **Review Video Scripts**
   - Navigate to each module directory
   - Open `02_Video_Scripts.md`
   - Verify timing and content accuracy

2. **Prioritize Modules**
   - **Recommended order**: Module 0 → Module 1 → Modules 2-8
   - Module 0 sets the tone and is perfect for demos

### Phase 2: NotebookLM Upload

1. **Access NotebookLM**
   - Go to https://notebooklm.google.com
   - Sign in with your Google account

2. **Create Notebook**
   - Click "New Notebook"
   - Name it: `HRM Module [X] - Video [Y]`
   - Example: `HRM Module 0 - Video 1`

3. **Upload Script**
   - Click "Add Source"
   - Upload the `02_Video_Scripts.md` file
   - Optionally add `01_Module_Analysis.md` for context

### Phase 3: Video Generation

1. **Use NotebookLM's Video Feature**
   - Select the video generation option
   - Use this prompt template:

```
Create a professional 5-7 minute educational video based on the script "[Video Title]".

Requirements:
- Follow the scene structure exactly as written
- Use the timing markers (e.g., 0:00-0:30) for pacing
- Implement all VISUAL cues with appropriate graphics/animations
- Use the NARRATOR voice-over text verbatim
- Include ON-SCREEN TEXT as specified
- Maintain a cybersecurity/professional theme
- Use engaging visuals that match the serious but accessible tone

Style: Professional, educational, engaging
Audience: Corporate employees learning about cybersecurity
Theme: Modern, clean, with blue/teal color scheme
```

2. **Review Generated Video**
   - Check duration matches script estimate (±30 seconds acceptable)
   - Verify all scenes are present
   - Ensure visuals match descriptions
   - Confirm narration is clear and professional

3. **Iterate if Needed**
   - If quality isn't satisfactory, adjust the prompt
   - Emphasize specific visual elements
   - Request different pacing or tone

### Phase 4: Download and Organize

1. **Download Video**
   - Export in highest quality available (1080p preferred)
   - Format: MP4 (H.264 codec recommended)

2. **File Naming Convention**
   ```
   Module_[XX]_Video_[YY]_[Title_Slug].mp4
   ```
   Examples:
   - `Module_00_Video_01_Stop_Blaming_People.mp4`
   - `Module_01_Video_01_The_Human_Risk_Problem.mp4`

3. **Directory Structure**
   ```
   MVP_LMS/
   └── public/
       └── media/
           └── videos/
               ├── module_00/
               │   ├── Module_00_Video_01_Stop_Blaming_People.mp4
               │   └── Module_00_Video_02_[Title].mp4
               ├── module_01/
               └── ...
   ```

4. **Create Thumbnails**
   - Extract a frame from the video (around 10-15 seconds in)
   - Save as JPG: `Module_00_Video_01_thumbnail.jpg`
   - Recommended size: 1280x720px

### Phase 5: Integration into LMS

1. **Update Database**
   - Run the media update script:
   ```bash
   cd backend
   npm run update-media -- --module 0
   ```

2. **Verify in LMS**
   - Log into the LMS
   - Navigate to the module
   - Check that video plays correctly
   - Verify thumbnail displays

3. **Quality Checklist**
   - [ ] Video duration matches script (±30 sec)
   - [ ] All scenes present and in order
   - [ ] Visuals match script descriptions
   - [ ] Narration is clear and audible
   - [ ] Transitions are smooth
   - [ ] Branding/theme is consistent
   - [ ] Video plays in LMS without errors
   - [ ] Thumbnail is visually appealing

## Batch Production Tips

### Time Management
- **Per video**: 30-60 minutes (including review and iterations)
- **Per module**: 1-2 hours (2 videos)
- **Full course**: 9-18 hours spread over 2-3 weeks

### Quality Control
- Generate videos in batches of 2-3
- Review all before proceeding
- Maintain consistency in style and tone
- Keep a log of successful prompts

### Alternative Tools
If NotebookLM doesn't meet your needs:
- **Synthesia**: AI video generation with avatars
- **Pictory**: Text-to-video with stock footage
- **Descript**: Video editing with AI features
- **Custom Production**: Hire video production team

## Troubleshooting

### Video Too Short/Long
- Adjust timing markers in script
- Simplify or expand narration
- Modify visual descriptions

### Visual Quality Issues
- Be more specific in prompts about visual style
- Provide reference images
- Request specific graphics or animations

### Narration Problems
- Specify voice characteristics (professional, warm, authoritative)
- Adjust pacing instructions
- Request re-generation with different voice

## Next Steps After Video Production

1. **Update all media placeholders** with actual video files
2. **Test complete user flow** from login to course completion
3. **Gather feedback** from pilot users
4. **Iterate on content** based on feedback
5. **Plan Phase 2 features** (gamification, analytics, etc.)

## Contact

For questions about the NotebookLM workflow or video production:
- Review the implementation plan
- Check the content leverage strategy document
- Consult the media replacement guide
