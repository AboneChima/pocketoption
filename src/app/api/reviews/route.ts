import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { name, email, rating, review, country } = await request.json()

    // Validate required fields
    if (!name || !email || !rating || !review) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create transporter for sending emails
    // Using Gmail SMTP (you can configure this with your preferred email service)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL || 'noreply.pocketoption@gmail.com',
        pass: process.env.SMTP_PASSWORD || 'your-app-password'
      }
    })

    // Email content
    const mailOptions = {
      from: process.env.SMTP_EMAIL || 'noreply.pocketoption@gmail.com',
      to: process.env.REVIEWS_EMAIL || 'reviews@pocketoption.com',
      subject: `New Review Submission - ${rating} Stars`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            New Customer Review Submission
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Customer Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Country:</strong> ${country || 'Not specified'}</p>
            <p><strong>Rating:</strong> ${'⭐'.repeat(rating)} (${rating}/5)</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Review Content</h3>
            <p style="line-height: 1.6; color: #4b5563;">${review}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Note:</strong> This review was submitted through the PocketOption website review form.
              Please review and approve before publishing.
            </p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Submitted on: ${new Date().toLocaleString()}</p>
            <p>PocketOption Review System</p>
          </div>
        </div>
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { message: 'Review submitted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}