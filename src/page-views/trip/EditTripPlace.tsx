'use client'
import Button from '@/components/designSystem/Buttons/Button'
import ButtonContainer from '@/components/ButtonContainer'
import CreateTripInputField from '@/components/designSystem/input/InputField'
import PlaceIcon from '@/components/icons/PlaceIcon'
import RelationKeywordList from '@/components/relationKeyword/RelationKeywordList'
import Spacing from '@/components/Spacing'

import { tripDetailStore } from '@/store/client/tripDetailStore'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditTripPlace() {
  const [showRelationList, setShowRelationList] = useState(true)
  const router = useRouter()

  const { location, addLocation: addLocationForEdit } = tripDetailStore()
  const [keyword, setKeyword] = useState(location)
  // const { data, isLoading } = useRelationKeyword(keyword)
  const changeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
    if (!showRelationList) {
      setShowRelationList(true)
    }
  }

  const clickRelationKeyword = (keyword: string) => {
    setKeyword(keyword)
    setShowRelationList(false)
  }

  const handleRemoveValue = () => setKeyword('')

  const handleDone = () => {
    addLocationForEdit(keyword)
    router.back()
  }

  return (
    <div className="px-6">
      <h2 className="text-2xl font-semibold leading-[33.6px] ml-[6px] text-left">어디로 떠나볼까요?</h2>
      <Spacing size={8} />
      <CreateTripInputField
        value={keyword}
        handleRemoveValue={handleRemoveValue}
        onChange={changeKeyword}
        icon={<PlaceIcon />}
      />
      {keyword.length > 0 && (
        <>
          {showRelationList && (
            <>
              <Spacing size={16} />
              <RelationKeywordList
                onClick={clickRelationKeyword}
                keyword={keyword}
              />
            </>
          )}
        </>
      )}
      <ButtonContainer>
        <Button
          onClick={handleDone}
          disabled={keyword === ''}
          addStyle={
            keyword === ''
              ? {
                  backgroundColor: 'rgba(220, 220, 220, 1)',
                  color: 'rgba(132, 132, 132, 1)',
                  boxShadow: '-2px 4px 5px 0px rgba(170, 170, 170, 0.1)'
                }
              : undefined
          }
          text={'완료'}
        />
      </ButtonContainer>
    </div>
  )
}
