import { NextRequest, NextResponse } from 'next/server'
import admin, { adminDb } from '@/lib/firebaseAdmin'
import { COLLECTIONS } from '@/lib/firebase'

type AdminDepositStatus = 'Confirmed' | 'Rejected'

function mapStatusForUi(status: string): string {
  const s = (status || '').toLowerCase()
  if (s === 'pending') return 'Pending'
  if (s === 'completed' || s === 'confirmed') return 'Confirmed'
  if (s === 'failed' || s === 'rejected') return 'Rejected'
  return status || 'Pending'
}

function toIsoDate(val: any): string {
  try {
    if (!val) return new Date().toISOString()
    if (val instanceof admin.firestore.Timestamp) return val.toDate().toISOString()
    if (val instanceof Date) return val.toISOString()
    const d = new Date(val)
    if (!isNaN(d.getTime())) return d.toISOString()
    return new Date().toISOString()
  } catch {
    return new Date().toISOString()
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Verify admin authentication using JWT/cookies as needed

    const snapshot = await adminDb.collection(COLLECTIONS.DEPOSITS).limit(100).get()
    const deposits = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data() as any
        const userId = data.userId
        let email = ''
        try {
          const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(userId).get()
          email = (userDoc.exists && (userDoc.data() as any)?.email) || ''
        } catch {
          email = ''
        }

        return {
          id: docSnap.id,
          amount: Number(data.amount) || 0,
          currency: data?.metadata?.currency || data?.currency || 'USD',
          address: data?.metadata?.address || data?.address || '',
          status: mapStatusForUi(data.status),
          createdAt: toIsoDate(data.createdAt),
          updatedAt: toIsoDate(data.updatedAt),
          user: { email },
        }
      })
    )

    // Sort newest first
    deposits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(deposits)
  } catch (error) {
    console.error('Error fetching admin deposits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deposits' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { depositId, status, adminNotes } = body as { depositId: string; status: AdminDepositStatus; adminNotes?: string }

    if (!depositId || !status) {
      return NextResponse.json({ error: 'Missing depositId or status' }, { status: 400 })
    }

    // Map UI status to internal status
    const internalStatus = status === 'Confirmed' ? 'completed' : 'failed'

    // Get deposit doc
    const depRef = adminDb.collection(COLLECTIONS.DEPOSITS).doc(depositId)
    const depSnap = await depRef.get()
    if (!depSnap.exists) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    const depData = depSnap.data() as any
    const userId: string = depData.userId
    const amount: number = Number(depData.amount) || 0

    // Update deposit status
    await depRef.update({
      status: internalStatus,
      updatedAt: new Date(),
      adminNotes: adminNotes || null,
    })

    // If confirmed, update user balance and add transaction
    if (internalStatus === 'completed') {
      const userRef = adminDb.collection(COLLECTIONS.USERS).doc(userId)

      // Increment balance
      await userRef.update({ balance: admin.firestore.FieldValue.increment(amount) })

      // Create transaction record
      const txnRef = adminDb.collection(COLLECTIONS.TRANSACTIONS).doc()
      await txnRef.set({
        id: txnRef.id,
        userId,
        type: 'deposit',
        amount,
        status: 'completed',
        description: `Deposit approved`,
        createdAt: new Date(),
        metadata: { depositId },
      })
    }

    // Create a simple notification for the user
    try {
      const notifRef = adminDb.collection('notifications').doc()
      await notifRef.set({
        id: notifRef.id,
        userId,
        type: 'deposit',
        depositId,
        status: internalStatus === 'completed' ? 'confirmed' : 'rejected',
        title: internalStatus === 'completed' ? 'Deposit Approved' : 'Deposit Rejected',
        message:
          internalStatus === 'completed'
            ? 'Your deposit has been approved and your balance updated.'
            : 'Your deposit was rejected. Please contact support if you need help.',
        createdAt: new Date(),
        read: false,
      })
    } catch (notifErr) {
      console.warn('Failed to create notification:', notifErr)
    }

    return NextResponse.json({ success: true, message: `Deposit ${status.toLowerCase()} successfully` })
  } catch (error) {
    console.error('Error processing admin deposit:', error)
    return NextResponse.json(
      { error: 'Failed to process deposit' },
      { status: 500 }
    )
  }
}
